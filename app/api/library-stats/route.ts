import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import Location from '@/models/Location'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const libraryId = new mongoose.Types.ObjectId(
    (session.user as { libraryId: string }).libraryId
  )

  const since12Months = new Date()
  since12Months.setMonth(since12Months.getMonth() - 11)
  since12Months.setDate(1)
  since12Months.setHours(0, 0, 0, 0)

  const [genreStats, authorStats, monthlyStats, locationStats, totals] = await Promise.all([
    // Répartition par genre
    Book.aggregate([
      { $match: { libraryId } },
      { $unwind: { path: '$genres', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, genre: '$_id', count: 1 } },
    ]),

    // Auteurs les plus représentés (top 10)
    Book.aggregate([
      { $match: { libraryId } },
      { $unwind: '$authors' },
      { $group: { _id: '$authors', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, author: '$_id', count: 1 } },
    ]),

    // Ajouts par mois (12 derniers mois)
    Book.aggregate([
      { $match: { libraryId, createdAt: { $gte: since12Months } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', count: 1 } },
    ]),

    // Livres par emplacement (groupés pièce > spot)
    Book.aggregate([
      { $match: { libraryId, locationId: { $ne: null } } },
      { $group: { _id: '$locationId', count: { $sum: 1 } } },
      { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'spot' } },
      { $unwind: '$spot' },
      { $lookup: { from: 'locations', localField: 'spot.parentId', foreignField: '_id', as: 'room' } },
      { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          locationId: { $toString: '$_id' },
          count: 1,
          spotName: '$spot.name',
          roomId:   { $toString: { $ifNull: ['$room._id', '$spot._id'] } },
          roomName: { $ifNull: ['$room.name', '$spot.name'] },
        },
      },
      { $sort: { roomName: 1, count: -1 } },
    ]),

    // Totaux
    Book.aggregate([
      { $match: { libraryId } },
      {
        $group: {
          _id: null,
          total:        { $sum: 1 },
          withCover:    { $sum: { $cond: [{ $and: [{ $ne: ['$cover', null] }, { $ne: ['$cover', ''] }] }, 1, 0] } },
          withGenre:    { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$genres', []] } }, 0] }, 1, 0] } },
          withLocation: { $sum: { $cond: [{ $ne: ['$locationId', null] }, 1, 0] } },
          favorites:    { $sum: { $cond: ['$favorite', 1, 0] } },
          withPrice:    { $sum: { $cond: [{ $isNumber: '$price' }, 1, 0] } },
          totalValue:   { $sum: { $cond: [{ $isNumber: '$price' }, '$price', 0] } },
        },
      },
    ]),
  ])

  // Organise locationStats en pièces avec leurs emplacements
  type LocRow = { locationId: string; count: number; spotName: string; roomId: string; roomName: string }
  const roomMap = new Map<string, { roomName: string; spots: { locationId: string; spotName: string; count: number }[]; total: number }>()
  for (const row of locationStats as LocRow[]) {
    if (!roomMap.has(row.roomId)) {
      roomMap.set(row.roomId, { roomName: row.roomName, spots: [], total: 0 })
    }
    const room = roomMap.get(row.roomId)!
    room.spots.push({ locationId: row.locationId, spotName: row.spotName, count: row.count })
    room.total += row.count
  }
  const roomStats = Array.from(roomMap.values()).sort((a, b) => b.total - a.total)

  return NextResponse.json({
    genreStats,
    authorStats,
    monthlyStats,
    roomStats,
    totals: totals[0] ?? { total: 0, withCover: 0, withGenre: 0, withLocation: 0, favorites: 0, withPrice: 0, totalValue: 0 },
  })
}

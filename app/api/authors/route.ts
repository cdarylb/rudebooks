import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = new URL(req.url).searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  await dbConnect()
  const libraryId = (session.user as { libraryId: string }).libraryId

  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

  const results = await Book.aggregate([
    { $match: { libraryId: new mongoose.Types.ObjectId(libraryId), authors: re } },
    { $unwind: '$authors' },
    { $match: { authors: re } },
    { $group: { _id: '$authors' } },
    { $sort: { _id: 1 } },
    { $limit: 8 },
    { $project: { _id: 0, name: '$_id' } },
  ])

  return NextResponse.json(results.map((r: { name: string }) => r.name))
}

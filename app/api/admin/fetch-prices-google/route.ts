import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import { fetchGoogleBooksPrice } from '@/lib/price'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const limit: number = typeof body.limit === 'number' ? body.limit : 200

  await dbConnect()
  const libraryId = new mongoose.Types.ObjectId((session.user as { libraryId: string }).libraryId)

  const query = { libraryId, isbn: { $exists: true, $ne: '' }, price: { $exists: false } }
  const books = await Book.find(query, { _id: 1, isbn: 1 })
    .sort({ priceCheckedAt: 1 })
    .limit(limit)
    .lean()

  let found = 0
  let errors = 0

  for (const book of books) {
    const price = await fetchGoogleBooksPrice(book.isbn as string)
    const now = new Date()
    if (price !== null) {
      await Book.updateOne({ _id: book._id }, { $set: { price, priceCheckedAt: now } }, { strict: false })
      found++
    } else {
      await Book.updateOne({ _id: book._id }, { $set: { priceCheckedAt: now } }, { strict: false })
      errors++
    }
  }

  const remaining = await Book.countDocuments(query)

  return NextResponse.json({ processed: books.length, found, errors, remaining })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const libraryId = new mongoose.Types.ObjectId((session.user as { libraryId: string }).libraryId)

  const remaining = await Book.countDocuments({
    libraryId,
    isbn: { $exists: true, $ne: '' },
    price: { $exists: false },
  })

  return NextResponse.json({ remaining })
}

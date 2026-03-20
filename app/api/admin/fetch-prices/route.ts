import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import { fetchPrice } from '@/lib/price'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const limit: number = typeof body.limit === 'number' ? body.limit : 50

  await dbConnect()
  const libraryId = new mongoose.Types.ObjectId((session.user as { libraryId: string }).libraryId)

  const query = { libraryId, isbn: { $exists: true, $ne: '' }, price: { $exists: false } }

  // priceCheckedAt: 1 → null/manquant en premier (jamais essayés), puis les plus anciens
  const books = await Book.find(query, { _id: 1, isbn: 1 })
    .sort({ priceCheckedAt: 1 })
    .limit(limit)
    .lean()

  let found = 0
  let errors = 0

  for (let i = 0; i < books.length; i++) {
    const price = await fetchPrice(books[i].isbn as string)
    const now = new Date()
    if (price !== null) {
      await Book.updateOne({ _id: books[i]._id }, { $set: { price, priceCheckedAt: now } }, { strict: false })
      found++
    } else {
      await Book.updateOne({ _id: books[i]._id }, { $set: { priceCheckedAt: now } }, { strict: false })
      errors++
    }
    if (i < books.length - 1) await sleep(1500)
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

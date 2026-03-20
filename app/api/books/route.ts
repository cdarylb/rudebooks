import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import { BookSchema } from '@/lib/validators/book'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const { searchParams } = new URL(req.url)
  const q            = searchParams.get('q')?.trim()
  const locationId   = searchParams.get('locationId')
  const genres       = searchParams.getAll('genre')
  const noCover      = searchParams.get('noCover') === '1'
  const noGenre      = searchParams.get('noGenre') === '1'
  const noLocation   = searchParams.get('noLocation') === '1'
  const noPrice      = searchParams.get('noPrice') === '1'
  const page         = parseInt(searchParams.get('page') ?? '1')
  const limit        = parseInt(searchParams.get('limit') ?? '20')
  const sort         = searchParams.get('sort')

  const libraryId = (session.user as { libraryId: string }).libraryId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { libraryId }

  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [
      { title:     re },
      { authors:   re },
      { isbn:      re },
      { publisher: re },
    ]
  }

  if (locationId) filter.locationId = locationId
  if (genres.length) filter.genres = { $all: genres }
  if (noCover) filter.cover = { $in: [null, ''] }
  if (noLocation) filter.locationId = null
  if (noGenre) filter.$and = [
    ...(filter.$and ?? []),
    { $or: [{ genres: { $exists: false } }, { genres: { $size: 0 } }] },
  ]
  if (noPrice) filter.$and = [
    ...(filter.$and ?? []),
    { $or: [{ price: { $exists: false } }, { price: null }] },
  ]

  const [books, total] = await Promise.all([
    Book.find(filter)
      .populate('locationId', 'name')
      .sort(sort === 'author' ? { 'authors.0': 1, title: 1 } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Book.countDocuments(filter),
  ])

  return NextResponse.json({ books, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = BookSchema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: data.error.flatten() }, { status: 400 })
    }

    await dbConnect()

    const libraryId = (session.user as { libraryId: string }).libraryId
    const { locationId, ...rest } = data.data
    const book = await Book.create({
      ...rest,
      ...(locationId ? { locationId } : {}),
      libraryId,
      addedBy: session.user.id,
    })

    return NextResponse.json(book, { status: 201 })
  } catch (err) {
    console.error('[books POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

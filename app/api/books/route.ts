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
  const q = searchParams.get('q')
  const locationId = searchParams.get('locationId')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  const libraryId = (session.user as { libraryId: string }).libraryId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { libraryId }
  if (q) filter.$text = { $search: q }
  if (locationId) filter.locationId = locationId
  if (status) filter.status = status

  const [books, total] = await Promise.all([
    Book.find(filter)
      .populate('locationId', 'name')
      .sort({ createdAt: -1 })
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

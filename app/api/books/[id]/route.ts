import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import '@/models/Location'
import { BookUpdateSchema } from '@/lib/validators/book'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const libraryId = (session.user as { libraryId: string }).libraryId

  const book = await Book.findOne({ _id: params.id, libraryId })
    .populate('locationId', 'name description')
    .lean()

  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(book)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = BookUpdateSchema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: data.error.flatten() }, { status: 400 })
    }

    await dbConnect()
    const libraryId = (session.user as { libraryId: string }).libraryId

    const { locationId, ...rest } = data.data
    const update = { ...rest, ...(locationId !== undefined ? { locationId } : {}) }
    const book = await Book.findOneAndUpdate(
      { _id: params.id, libraryId },
      { $set: update },
      { new: true, strict: false }
    ).populate('locationId', 'name')

    if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(book)
  } catch (err) {
    console.error('[book PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const libraryId = (session.user as { libraryId: string }).libraryId

  const book = await Book.findOneAndDelete({ _id: params.id, libraryId })
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}

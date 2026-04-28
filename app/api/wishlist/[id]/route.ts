import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import WishlistItem from '@/models/WishlistItem'
import Book from '@/models/Book'
import { WishlistItemUpdateSchema } from '@/lib/validators/wishlist'

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = WishlistItemUpdateSchema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: data.error.flatten() }, { status: 400 })
    }

    await dbConnect()
    const libraryId = (session.user as { libraryId: string }).libraryId

    const item = await WishlistItem.findOneAndUpdate(
      { _id: params.id, libraryId },
      { $set: data.data },
      { new: true }
    )

    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // If marked as purchased, optionally promote to the books collection
    if (data.data.status === 'purchased' && body.promoteToBook) {
      await Book.create({
        libraryId,
        title: item.title,
        authors: item.authors ?? [],
        isbn: item.isbn,
        cover: item.cover,
        description: item.description,
        status: 'owned',
        addedBy: (session.user as { id: string }).id,
      })
    }

    return NextResponse.json(item)
  } catch (err) {
    console.error('[wishlist PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const libraryId = (session.user as { libraryId: string }).libraryId

  const item = await WishlistItem.findOneAndDelete({ _id: params.id, libraryId })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}

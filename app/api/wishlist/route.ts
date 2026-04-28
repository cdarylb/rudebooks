import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import WishlistItem from '@/models/WishlistItem'
import { WishlistItemSchema } from '@/lib/validators/wishlist'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'wanted'
  const priority = searchParams.get('priority')
  const libraryId = (session.user as { libraryId: string }).libraryId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { libraryId, status }
  if (priority) filter.priority = priority

  const items = await WishlistItem.find(filter).sort({ createdAt: -1 }).lean()
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = WishlistItemSchema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: data.error.flatten() }, { status: 400 })
    }

    await dbConnect()
    const libraryId = (session.user as { libraryId: string }).libraryId

    const item = await WishlistItem.create({
      ...data.data,
      libraryId,
      addedBy: (session.user as { id: string }).id,
    })

    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error('[wishlist POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

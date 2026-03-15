import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import ReadingList from '@/models/ReadingList'

type Params = { params: { bookId: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: userId, libraryId } = session.user as { id: string; libraryId: string }

  await dbConnect()

  const item = await ReadingList.findOneAndUpdate(
    { userId, bookId: params.bookId },
    { userId, bookId: params.bookId, libraryId },
    { upsert: true, new: true }
  )

  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: userId } = session.user as { id: string }

  await dbConnect()

  await ReadingList.findOneAndDelete({ userId, bookId: params.bookId })

  return NextResponse.json({ ok: true })
}

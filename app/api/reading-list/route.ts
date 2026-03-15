import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import ReadingList from '@/models/ReadingList'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: userId, libraryId } = session.user as { id: string; libraryId: string }

  await dbConnect()

  const items = await ReadingList.find({ userId, libraryId })
    .sort({ addedAt: -1 })
    .populate({
      path: 'bookId',
      select: 'title authors cover',
    })
    .lean()

  return NextResponse.json(items)
}

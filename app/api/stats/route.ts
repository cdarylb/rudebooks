import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import Location from '@/models/Location'
import WishlistItem from '@/models/WishlistItem'
import ReadingList from '@/models/ReadingList'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const { libraryId, id: userId } = session.user as { libraryId: string; id: string }

  const [totalBooks, wishlistCount, readingListCount, recentBooks] = await Promise.all([
    Book.countDocuments({ libraryId }),
    WishlistItem.countDocuments({ libraryId, status: 'wanted' }),
    ReadingList.countDocuments({ userId, libraryId }),
    Book.find({ libraryId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('locationId', 'name')
      .lean(),
  ])

  return NextResponse.json({
    totalBooks,
    wishlistCount,
    readingListCount,
    recentBooks,
  })
}

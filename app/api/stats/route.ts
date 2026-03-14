import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import WishlistItem from '@/models/WishlistItem'
import Location from '@/models/Location'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const libraryId = (session.user as { libraryId: string }).libraryId

  const [totalBooks, lentBooks, wishlistCount, locationCount, recentBooks] = await Promise.all([
    Book.countDocuments({ libraryId }),
    Book.countDocuments({ libraryId, status: 'lent' }),
    WishlistItem.countDocuments({ libraryId, status: 'wanted' }),
    Location.countDocuments({ libraryId }),
    Book.find({ libraryId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('locationId', 'name')
      .lean(),
  ])

  return NextResponse.json({
    totalBooks,
    lentBooks,
    wishlistCount,
    locationCount,
    recentBooks,
  })
}

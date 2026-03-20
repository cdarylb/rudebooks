import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'

// Renomme 'Science-fiction' → 'SF / Fantasy' dans tous les livres de la bibliothèque
export async function POST(req: NextRequest) {
  void req
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const libraryId = (session.user as { libraryId: string }).libraryId

  const result = await Book.updateMany(
    { libraryId, genres: 'Science-fiction' },
    { $set: { 'genres.$[el]': 'SF / Fantasy' } },
    { arrayFilters: [{ el: 'Science-fiction' }] }
  )

  return NextResponse.json({ updated: result.modifiedCount })
}

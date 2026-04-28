import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import ReadingList from '@/models/ReadingList'
import PageHeader from '@/components/layout/PageHeader'
import BookCard from '@/components/books/BookCard'
import EmptyState from '@/components/ui/EmptyState'
import { BookMarked } from 'lucide-react'

export default async function ReadingListPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const { id: userId, libraryId } = session.user as { id: string; libraryId: string }

  await dbConnect()

  const items = await ReadingList.find({ userId, libraryId })
    .sort({ addedAt: -1 })
    .populate({ path: 'bookId', select: 'title authors cover locationId' })
    .lean()

  const books = items
    .map((item) => item.bookId as unknown as { _id: object; title: string; authors: string[]; cover?: string; locationId?: { name: string } | null })
    .filter(Boolean)

  return (
    <div className="space-y-4">
      <PageHeader title="À lire" backHref="/dashboard" />

      {books.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="Aucun livre dans votre liste"
          description="Marquez des livres comme « À lire » depuis leur page"
        />
      ) : (
        <div className="space-y-2">
          {books.map((book) => (
            <BookCard key={book._id.toString()} book={{ ...book, _id: book._id.toString() }} />
          ))}
        </div>
      )}
    </div>
  )
}

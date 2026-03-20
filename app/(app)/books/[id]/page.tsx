import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import BookDetailToolbar from '@/components/books/BookDetailToolbar'
import BookDetailActions from '@/components/books/BookDetailActions'
import BookCover from '@/components/books/BookCover'
import ReadingListButton from '@/components/books/ReadingListButton'
import ReadingList from '@/models/ReadingList'
import { formatAuthors } from '@/lib/utils'
import { Genre } from '@/lib/genres'
import PriceEditor from '@/components/books/PriceEditor'

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  await dbConnect()
  const { id: userId, libraryId } = session.user as { id: string; libraryId: string }
  const book = await Book.findOne({ _id: params.id, libraryId })
    .populate({ path: 'locationId', populate: { path: 'parentId', select: 'name' } })
    .lean()

  if (!book) notFound()

  const inReadingList = !!(await ReadingList.findOne({ userId, bookId: params.id }))
  const loc = book.locationId as { name: string; parentId?: { name: string } | null } | null

  return (
    <div className="space-y-4">
      {/* Header row: back ← on left, action buttons on right */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Link href="/books"
          className="p-1.5 rounded-lg hover:bg-surface-2 transition flex-shrink-0 -ml-1.5">
          <ChevronLeft size={20} className="text-ink-muted" />
        </Link>
        <div className="flex items-center gap-2">
          <ReadingListButton bookId={params.id} initialInList={inReadingList} />
          <BookDetailToolbar
            bookId={params.id}
            editHref={`/books/${params.id}/edit`}
            isbn={book.isbn}
            title={book.title}
            currentCover={book.cover}
            initialFavorite={book.favorite ?? false}
            initialPrice={book.price}
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex gap-4">
          {book.cover ? (
            <BookCover src={book.cover} alt={book.title} />
          ) : (
            <div className="w-20 h-28 rounded-lg bg-surface-3 flex items-center justify-center flex-shrink-0">
              <BookOpen size={28} className="text-ink-subtle" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-xl font-bold text-ink leading-tight">{book.title}</h1>
            <p className="text-ink-muted text-sm mt-1">{formatAuthors(book.authors)}</p>
            {book.publishedYear && (
              <p className="text-ink-subtle text-xs mt-1 flex items-center gap-1">
                <Calendar size={12} />
                {book.publishedYear}
              </p>
            )}
          </div>
        </div>

        {loc && (
          <div className="mt-4 flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2">
            <MapPin size={14} className="text-primary flex-shrink-0" />
            <span className="text-sm text-ink flex items-center gap-1">
              {loc.parentId && (
                <>
                  <span className="text-ink-muted">{loc.parentId.name}</span>
                  <ChevronRight size={12} className="text-ink-subtle flex-shrink-0" />
                </>
              )}
              {loc.name}
              {book.locationNote && (
                <span className="text-ink-subtle"> — {book.locationNote}</span>
              )}
            </span>
          </div>
        )}

        {book.description && (
          <p className="mt-4 text-sm text-ink-muted leading-relaxed line-clamp-6">{book.description}</p>
        )}

        <div className="mt-3 flex items-center gap-3">
          {book.isbn && (
            <p className="font-mono text-xs text-ink-subtle">ISBN: {book.isbn}</p>
          )}
          <PriceEditor bookId={params.id} initialPrice={book.price} />
        </div>
      </div>

      <BookDetailActions
        bookId={params.id}
        initialGenres={(book.genres ?? []) as Genre[]}
      />
    </div>
  )
}

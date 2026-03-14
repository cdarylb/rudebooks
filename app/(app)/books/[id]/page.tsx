import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Edit, Calendar, BookOpen, ChevronRight } from 'lucide-react'
import dbConnect from '@/lib/db'
import Book from '@/models/Book'
import Location from '@/models/Location'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PageHeader from '@/components/layout/PageHeader'
import CoverSearch from '@/components/books/CoverSearch'
import { formatAuthors } from '@/lib/utils'

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  await dbConnect()
  const libraryId = (session.user as { libraryId: string }).libraryId
  const book = await Book.findOne({ _id: params.id, libraryId })
    .populate({ path: 'locationId', populate: { path: 'parentId', select: 'name' } })
    .lean()

  if (!book) notFound()

  const loc = book.locationId as { name: string; parentId?: { name: string } | null } | null

  return (
    <div className="space-y-4">
      <PageHeader
        title=""
        backHref="/books"
        action={
          <Link href={`/books/${params.id}/edit`} className="p-2 rounded-lg hover:bg-surface-2 transition">
            <Edit size={18} className="text-ink-muted" />
          </Link>
        }
      />

      <div className="glass-card rounded-2xl p-5">
        <div className="flex gap-4">
          {book.cover ? (
            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={book.cover} alt={book.title} className="w-full h-full object-contain" />
            </div>
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

        {book.isbn && (
          <p className="mt-3 font-mono text-xs text-ink-subtle">ISBN: {book.isbn}</p>
        )}

        <CoverSearch
          bookId={params.id}
          isbn={book.isbn}
          title={book.title}
          currentCover={book.cover}
        />
      </div>
    </div>
  )
}

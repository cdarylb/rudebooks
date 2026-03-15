'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { BookMarked, BookOpen } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface ReadingItem {
  _id: string
  bookId: {
    _id: string
    title: string
    authors: string[]
    cover?: string
  }
}

export default function ReadingListPreview() {
  const { data, isLoading } = useSWR<ReadingItem[]>('/api/reading-list', fetcher)

  if (isLoading || !data?.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-ink flex items-center gap-2">
          <BookMarked size={16} className="text-primary" />
          Ma liste à lire
        </h2>
        <Link href="/reading-list" className="text-xs text-primary hover:underline flex items-center gap-0.5">
          Voir tout ({data.length})
        </Link>
      </div>

      <div className="space-y-2">
        {data.slice(0, 5).map(({ _id, bookId: book }) => (
          <Link key={_id} href={`/books/${book._id}`}>
            <div className="glass-card rounded-xl p-3 flex gap-3 hover:shadow-card-hover hover:border-edge/80 transition-all active:scale-[0.98]">
              <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0">
                {book.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.cover} alt={book.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-surface-3 flex items-center justify-center">
                    <BookOpen size={14} className="text-ink-subtle" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink leading-snug line-clamp-1">{book.title}</p>
                <p className="text-xs text-ink-muted mt-0.5 truncate">{book.authors?.join(', ')}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

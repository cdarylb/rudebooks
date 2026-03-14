'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { formatAuthors } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Book {
  _id: string
  title: string
  authors: string[]
  cover?: string
}

export default function RecentBooks() {
  const { data } = useSWR<{ recentBooks: Book[] }>('/api/stats', fetcher)
  const books = data?.recentBooks ?? []

  if (!books.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-ink">Ajouts récents</h2>
        <Link href="/books" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
          Voir tout <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {books.map((book) => (
          <Link key={book._id} href={`/books/${book._id}`} className="flex-shrink-0 w-20">
            <div className="relative w-20 h-28 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              {book.cover
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={book.cover} alt={book.title} className="w-full h-full object-contain" />
                : <div className="w-full h-full bg-surface-3 flex items-center justify-center">
                    <BookOpen size={24} className="text-ink-subtle" />
                  </div>
              }
            </div>
            <p className="text-xs text-ink mt-1.5 line-clamp-2 leading-tight">{book.title}</p>
            <p className="text-xs text-ink-muted truncate">{formatAuthors(book.authors)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

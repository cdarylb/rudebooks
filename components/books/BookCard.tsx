'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, BookOpen, BookMarked } from 'lucide-react'
import { formatAuthors } from '@/lib/utils'

interface BookCardProps {
  book: {
    _id: string
    title: string
    authors: string[]
    cover?: string
    locationId?: { name: string } | null
  }
  inReadingList?: boolean
}

export default function BookCard({ book, inReadingList: initialInList }: BookCardProps) {
  const [inList, setInList] = useState(initialInList ?? false)
  const showToggle = initialInList !== undefined

  async function toggleReadingList(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const method = inList ? 'DELETE' : 'POST'
    const res = await fetch(`/api/reading-list/${book._id}`, { method })
    if (res.ok) setInList((v) => !v)
  }

  return (
    <Link href={`/books/${book._id}`}>
      <div className="glass-card rounded-xl p-3 flex gap-3 hover:shadow-card-hover hover:border-edge/80 transition-all active:scale-[0.98]">
        <div className="relative w-12 h-16 rounded-md overflow-hidden flex-shrink-0">
          {book.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover} alt={book.title} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-surface-3 flex items-center justify-center">
              <BookOpen size={18} className="text-ink-subtle" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm leading-snug line-clamp-2">{book.title}</p>
          <p className="text-xs text-ink-muted mt-0.5 truncate">{formatAuthors(book.authors)}</p>

          {book.locationId && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-ink-subtle flex items-center gap-0.5 truncate">
                <MapPin size={10} className="flex-shrink-0" />
                {book.locationId.name}
              </span>
            </div>
          )}
        </div>

        {showToggle && (
          <button
            onClick={toggleReadingList}
            title={inList ? 'Retirer de la liste à lire' : 'Ajouter à la liste à lire'}
            className={`self-center p-2 rounded-lg transition flex-shrink-0 ${
              inList
                ? 'text-primary'
                : 'text-ink-subtle hover:text-primary'
            }`}
          >
            <BookMarked size={16} className={inList ? 'fill-primary/20' : ''} />
          </button>
        )}
      </div>
    </Link>
  )
}

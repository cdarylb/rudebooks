'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, BookOpen, BookMarked } from 'lucide-react'
import { formatAuthors } from '@/lib/utils'
import QuickLocationPicker from './QuickLocationPicker'

interface BookCardProps {
  book: {
    _id: string
    title: string
    authors: string[]
    cover?: string
    locationId?: { _id?: string; name: string } | null
  }
  inReadingList?: boolean
}

export default function BookCard({ book, inReadingList: initialInList }: BookCardProps) {
  const router = useRouter()
  const [inList, setInList]     = useState(initialInList ?? false)
  const [location, setLocation] = useState(book.locationId ?? null)
  const showToggle = initialInList !== undefined

  async function toggleReadingList(e: React.MouseEvent) {
    e.stopPropagation()
    const method = inList ? 'DELETE' : 'POST'
    const res = await fetch(`/api/reading-list/${book._id}`, { method })
    if (res.ok) setInList((v) => !v)
  }

  return (
    <div
      onClick={() => router.push(`/books/${book._id}`)}
      className="glass-card rounded-xl p-3 flex gap-3 hover:shadow-card-hover hover:border-edge/80 transition-all active:scale-[0.98] cursor-pointer"
    >
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

        <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
          {location ? (
            <span className="text-xs text-ink-subtle flex items-center gap-0.5 truncate">
              <MapPin size={10} className="flex-shrink-0" />
              {location.name}
            </span>
          ) : showToggle && (
            <QuickLocationPicker
              bookId={book._id}
              onSaved={(loc) => setLocation(loc)}
            />
          )}
        </div>
      </div>

      {showToggle && (
        <button
          onClick={toggleReadingList}
          title={inList ? 'Retirer de la liste à lire' : 'Ajouter à la liste à lire'}
          className={`self-center p-2 rounded-lg transition flex-shrink-0 ${
            inList ? 'text-primary' : 'text-ink-subtle hover:text-primary'
          }`}
        >
          <BookMarked size={16} className={inList ? 'fill-primary/20' : ''} />
        </button>
      )}
    </div>
  )
}

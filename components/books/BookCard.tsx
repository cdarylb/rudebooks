import Link from 'next/link'
import { MapPin, BookOpen } from 'lucide-react'
import { formatAuthors } from '@/lib/utils'

interface BookCardProps {
  book: {
    _id: string
    title: string
    authors: string[]
    cover?: string
    status: 'owned' | 'lent'
    locationId?: { name: string } | null
  }
}

export default function BookCard({ book }: BookCardProps) {
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

          <div className="flex items-center gap-2 mt-1.5">
            {book.status === 'lent' && (
              <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
                Prêté
              </span>
            )}
            {book.locationId && (
              <span className="text-xs text-ink-subtle flex items-center gap-0.5 truncate">
                <MapPin size={10} className="flex-shrink-0" />
                {book.locationId.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

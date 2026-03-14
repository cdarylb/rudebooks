import Link from 'next/link'
import { Heart, ExternalLink } from 'lucide-react'
import { formatAuthors, priorityColor, priorityLabel } from '@/lib/utils'

interface WishlistCardProps {
  item: {
    _id: string
    title: string
    authors?: string[]
    cover?: string
    priority: 'low' | 'medium' | 'high'
    sourceUrl?: string
    price?: number
    currency?: string
  }
}

export default function WishlistCard({ item }: WishlistCardProps) {
  return (
    <div className="glass-card rounded-xl p-3 flex gap-3">
      <div className="relative w-12 h-16 rounded-md overflow-hidden flex-shrink-0">
        {item.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.cover} alt={item.title} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full bg-surface-3 flex items-center justify-center">
            <Heart size={18} className="text-primary/60" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={`/wishlist/${item._id}`}>
          <p className="font-medium text-ink text-sm leading-snug line-clamp-2 hover:text-primary transition">
            {item.title}
          </p>
        </Link>
        {item.authors && item.authors.length > 0 && (
          <p className="text-xs text-ink-muted mt-0.5 truncate">{formatAuthors(item.authors)}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${priorityColor(item.priority)}`}>
            {priorityLabel(item.priority)}
          </span>
          {item.price != null && (
            <span className="text-xs text-ink-muted font-medium">
              {item.price.toFixed(2)} {item.currency ?? 'EUR'}
            </span>
          )}
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-ink-subtle hover:text-primary flex items-center gap-0.5 transition">
              <ExternalLink size={11} />
              Lien
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

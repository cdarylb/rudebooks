'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Heart } from 'lucide-react'
import WishlistCard from './WishlistCard'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface WishlistItem {
  _id: string; title: string; authors?: string[]; cover?: string
  priority: 'low' | 'medium' | 'high'; sourceUrl?: string; price?: number; currency?: string
}

const PRIORITIES = [
  { value: '', label: 'Tous' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' },
]

export default function WishlistList() {
  const [priority, setPriority] = useState('')
  const params = priority ? `?priority=${priority}` : ''
  const { data: items, isLoading } = useSWR<WishlistItem[]>(`/api/wishlist${params}`, fetcher)

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PRIORITIES.map((p) => (
          <button key={p.value} onClick={() => setPriority(p.value)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition',
              priority === p.value
                ? 'gradient-primary text-white'
                : 'bg-surface-2 border border-edge text-ink-muted hover:border-primary/40'
            )}>
            {p.label}
          </button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-12"><Spinner /></div>}

      {!isLoading && items?.length === 0 && (
        <EmptyState icon={Heart} title="Liste de souhaits vide"
          description="Ajoutez des livres que vous aimeriez lire ou posséder" />
      )}

      <div className="space-y-2">
        {items?.map((item) => <WishlistCard key={item._id} item={item} />)}
      </div>
    </div>
  )
}

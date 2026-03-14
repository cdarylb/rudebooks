'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import WishlistCard from '@/components/wishlist/WishlistCard'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface WishlistItem {
  _id: string
  title: string
  authors?: string[]
  cover?: string
  priority: 'low' | 'medium' | 'high'
  sourceUrl?: string
  price?: number
  currency?: string
}

export default function WishlistPreview() {
  const { data } = useSWR<WishlistItem[]>('/api/wishlist?limit=3', fetcher)

  if (!data?.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-ink">Liste de souhaits</h2>
        <Link href="/wishlist" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
          Voir tout <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-2">
        {data.slice(0, 3).map((item) => (
          <WishlistCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { BookOpen, BookMarked, Heart } from 'lucide-react'
import Spinner from '@/components/ui/Spinner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Stats { totalBooks: number; wishlistCount: number; readingListCount: number }

export default function StatsGrid() {
  const { data: stats } = useSWR<Stats>('/api/stats', fetcher)

  if (!stats) return <div className="flex justify-center py-8"><Spinner /></div>

  const cards = [
    { label: 'Livres',   icon: BookOpen,   href: '/books',        value: stats.totalBooks      },
    { label: 'À lire',   icon: BookMarked, href: '/reading-list', value: stats.readingListCount },
    { label: 'Souhaits', icon: Heart,      href: '/wishlist',     value: stats.wishlistCount   },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({ label, icon: Icon, href, value }) => (
        <Link key={label} href={href}
          className="glass-card rounded-2xl p-4 hover:border-primary/40 hover:shadow-card-hover transition-all active:scale-[0.97]">
          <Icon size={16} className="text-ink-subtle mb-2" />
          <p className="text-2xl font-heading font-bold text-ink">{value}</p>
          <p className="text-xs text-ink-muted mt-0.5">{label}</p>
        </Link>
      ))}
    </div>
  )
}

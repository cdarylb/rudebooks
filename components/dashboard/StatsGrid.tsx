'use client'

import useSWR from 'swr'
import { BookOpen, Heart, MapPin, BookMarked } from 'lucide-react'
import Spinner from '@/components/ui/Spinner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Stats { totalBooks: number; lentBooks: number; wishlistCount: number; locationCount: number }

const cards = [
  { key: 'totalBooks',    label: 'Livres',       icon: BookOpen   },
  { key: 'lentBooks',     label: 'Prêtés',       icon: BookMarked },
  { key: 'wishlistCount', label: 'Souhaits',     icon: Heart      },
  { key: 'locationCount', label: 'Emplacements', icon: MapPin     },
]

export default function StatsGrid() {
  const { data } = useSWR<Stats>('/api/stats', fetcher)

  if (!data) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ key, label, icon: Icon }) => (
        <div key={key} className="glass-card rounded-2xl p-4">
          <Icon size={16} className="text-ink-subtle mb-2" />
          <p className="text-2xl font-heading font-bold text-ink">{data[key as keyof Stats]}</p>
          <p className="text-xs text-ink-muted mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

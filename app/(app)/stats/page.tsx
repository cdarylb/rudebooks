'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { BookOpen, Image, Tag, MapPin, Heart, ChevronDown } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import Spinner from '@/components/ui/Spinner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

interface GenreStat  { genre: string;  count: number }
interface AuthorStat { author: string; count: number }
interface MonthlyStat { year: number; month: number; count: number }
interface Totals {
  total: number; withCover: number; withGenre: number
  withLocation: number; favorites: number
}
interface SpotStat  { locationId: string; spotName: string; count: number }
interface RoomStat  { roomName: string; spots: SpotStat[]; total: number }
interface StatsData {
  genreStats: GenreStat[]
  authorStats: AuthorStat[]
  monthlyStats: MonthlyStat[]
  roomStats: RoomStat[]
  totals: Totals
}

function getLast12Months() {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  })
}

function pct(value: number, max: number) {
  return max === 0 ? 0 : Math.round((value / max) * 100)
}

const rowClass = 'flex items-center gap-2 group cursor-pointer rounded-lg px-1 -mx-1 hover:bg-surface-3 transition'

export default function StatsPage() {
  const [closedRooms, setClosedRooms] = useState<Set<string>>(new Set())
  const { data, isLoading } = useSWR<StatsData>('/api/library-stats', fetcher)

  function toggleRoom(name: string) {
    setClosedRooms((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Statistiques" />
        <div className="flex justify-center py-16"><Spinner /></div>
      </div>
    )
  }

  const { genreStats, authorStats, monthlyStats, roomStats, totals } = data

  const months = getLast12Months()
  const monthlyMap = new Map(monthlyStats.map((m) => [`${m.year}-${m.month}`, m.count]))
  const monthlySeries = months.map((m) => ({
    label: MONTH_LABELS[m.month - 1],
    count: monthlyMap.get(`${m.year}-${m.month}`) ?? 0,
  }))
  const maxMonthly = Math.max(...monthlySeries.map((m) => m.count), 1)
  const maxGenre   = genreStats[0]?.count ?? 1
  const maxAuthor  = authorStats[0]?.count ?? 1

  const summaryCards = [
    { label: 'Livres',       icon: BookOpen, value: totals.total,        color: 'text-primary',      href: '/books' },
    { label: 'Sans couverture', icon: Image, value: totals.total - totals.withCover, color: 'text-emerald-400', href: '/books?noCover=1' },
    { label: 'Sans genre',   icon: Tag,      value: totals.total - totals.withGenre, color: 'text-violet-400', href: '/books?noGenre=1' },
    { label: 'Sans emplacement', icon: MapPin, value: totals.total - totals.withLocation, color: 'text-amber-400', href: '/books?noLocation=1' },
    { label: 'Favoris',      icon: Heart,    value: totals.favorites,    color: 'text-rose-400',     href: '/books' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="Statistiques" />

      {/* Summary */}
      <div className="grid grid-cols-5 gap-2">
        {summaryCards.map(({ label, icon: Icon, value, color, href }) => (
          <Link key={label} href={href}
            className="glass-card rounded-xl p-2.5 flex flex-col items-center gap-1 text-center hover:border-primary/40 hover:shadow-card-hover transition-all active:scale-[0.97]">
            <Icon size={14} className={color} />
            <p className="text-lg font-heading font-bold text-ink leading-none">{value}</p>
            <p className="text-[10px] text-ink-muted leading-tight">{label}</p>
          </Link>
        ))}
      </div>

      {/* Ajouts par mois */}
      <section className="glass-card rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-ink">Ajouts par mois</h2>
        <div className="flex items-end gap-1.5 h-28">
          {monthlySeries.map(({ label, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-ink-subtle">{count > 0 ? count : ''}</span>
              <div
                className="w-full rounded-t-sm bg-primary/70 transition-all"
                style={{ height: `${pct(count, maxMonthly)}%`, minHeight: count > 0 ? '2px' : '0' }}
              />
              <span className="text-[9px] text-ink-muted">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pièces & emplacements */}
      {roomStats?.length > 0 && (
        <section className="glass-card rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-ink">Livres par emplacement</h2>
          <div className="space-y-2">
            {roomStats.map(({ roomName, spots, total }) => {
              const isOpen = !closedRooms.has(roomName)
              const maxSpot = spots[0]?.count ?? 1
              return (
                <div key={roomName} className="border border-edge rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleRoom(roomName)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 bg-surface-2 hover:bg-surface-3 transition text-ink"
                  >
                    <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                    <span className="flex-1 text-left text-xs font-semibold">{roomName}</span>
                    <span className="text-xs opacity-70">{total} livre{total > 1 ? 's' : ''}</span>
                  </button>
                  {isOpen && (
                    <div className="divide-y divide-edge">
                      {spots.map(({ locationId, spotName, count }) => (
                        <Link
                          key={locationId}
                          href={`/books?locationId=${locationId}`}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-surface-3 transition group text-ink-muted"
                        >
                          <span className="text-xs w-36 shrink-0 truncate group-hover:text-primary transition">{spotName}</span>
                          <div className="flex-1 bg-surface-3 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full bg-amber-400/70" style={{ width: `${pct(count, maxSpot)}%` }} />
                          </div>
                          <span className="text-xs w-8 text-right shrink-0">{count}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Genres */}
      {genreStats.length > 0 && (
        <section className="glass-card rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-ink">Répartition par genre</h2>
          <div className="space-y-1.5">
            {genreStats.map(({ genre, count }) => (
              <Link key={genre} href={`/books?genre=${encodeURIComponent(genre)}`} className={rowClass}>
                <span className="text-xs text-ink-muted w-28 shrink-0 truncate group-hover:text-primary transition">{genre}</span>
                <div className="flex-1 bg-surface-3 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all"
                    style={{ width: `${pct(count, maxGenre)}%` }}
                  />
                </div>
                <span className="text-xs text-ink-subtle w-6 text-right shrink-0">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Auteurs */}
      {authorStats.length > 0 && (
        <section className="glass-card rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-ink">Auteurs les plus représentés</h2>
          <div className="space-y-1.5">
            {authorStats.map(({ author, count }, i) => (
              <Link key={author} href={`/books?q=${encodeURIComponent(author)}`} className={rowClass}>
                <span className="text-xs text-ink-subtle w-4 shrink-0 text-right">{i + 1}</span>
                <span className="text-xs text-ink-muted w-28 shrink-0 truncate group-hover:text-primary transition">{author}</span>
                <div className="flex-1 bg-surface-3 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500/60 transition-all"
                    style={{ width: `${pct(count, maxAuthor)}%` }}
                  />
                </div>
                <span className="text-xs text-ink-subtle w-6 text-right shrink-0">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

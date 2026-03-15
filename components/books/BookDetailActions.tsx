'use client'

import { useState } from 'react'
import { GENRES, Genre } from '@/lib/genres'

interface BookDetailActionsProps {
  bookId: string
  initialGenres: Genre[]
}

export default function BookDetailActions({ bookId, initialGenres }: BookDetailActionsProps) {
  const [genres, setGenres] = useState<Genre[]>(initialGenres)
  const [saving, setSaving] = useState(false)

  async function toggleGenre(g: Genre) {
    if (saving) return
    setSaving(true)
    const next = genres.includes(g) ? genres.filter((x) => x !== g) : [...genres, g]
    setGenres(next)
    await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genres: next }),
    })
    setSaving(false)
  }

  return (
    <div className="glass-card rounded-2xl p-4 space-y-2">
      <p className="text-xs font-medium text-ink-subtle uppercase tracking-wide">
        Genres
        {genres.length === 0 && (
          <span className="ml-2 text-amber-400 normal-case font-normal">non renseigné</span>
        )}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {GENRES.map((g) => {
          const active = genres.includes(g)
          return (
            <button key={g} type="button" onClick={() => toggleGenre(g)} disabled={saving}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${
                active
                  ? 'bg-primary/20 border-primary/50 text-primary'
                  : 'bg-surface-2 border-edge text-ink-subtle hover:border-primary/30 hover:text-ink'
              }`}>
              {g}
            </button>
          )
        })}
      </div>
    </div>
  )
}

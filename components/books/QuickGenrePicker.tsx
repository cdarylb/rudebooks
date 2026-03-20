'use client'

import { useState, useRef, useEffect } from 'react'
import { Tag } from 'lucide-react'
import { GENRES, Genre } from '@/lib/genres'

interface QuickGenrePickerProps {
  bookId: string
  initialGenres?: Genre[]
  onSaved: (genres: Genre[]) => void
}

export default function QuickGenrePicker({ bookId, initialGenres = [], onSaved }: QuickGenrePickerProps) {
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<Genre[]>(initialGenres)
  const [saving, setSaving]     = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Reset selection when re-opened
  useEffect(() => {
    if (open) setSelected(initialGenres)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Ferme le menu au clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function toggle(genre: Genre) {
    setSelected((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  async function save() {
    if (saving) return
    setSaving(true)
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genres: selected }),
    })
    if (res.ok) {
      onSaved(selected)
      setOpen(false)
    }
    setSaving(false)
  }

  return (
    <div ref={ref} className="relative" onClick={(e) => e.preventDefault()}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        disabled={saving}
        title="Attribuer un genre"
        className="flex items-center gap-1 text-xs text-ink-subtle hover:text-primary border border-dashed border-edge hover:border-primary/50 rounded-lg px-2 py-1 transition disabled:opacity-50"
      >
        <Tag size={11} />
        <span>Genre</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 bg-surface-2 border border-edge rounded-xl shadow-card-hover p-3 w-64"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={save}
            disabled={saving || selected.length === 0}
            className="w-full text-xs font-medium bg-primary text-white rounded-lg py-1.5 hover:bg-primary/90 transition disabled:opacity-40 mb-3"
          >
            {saving ? 'Enregistrement…' : `Valider (${selected.length})`}
          </button>

          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((genre) => {
              const active = selected.includes(genre as Genre)
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggle(genre as Genre)}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                    active
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-surface-3 border-edge text-ink-subtle hover:border-primary/30'
                  }`}
                >
                  {genre}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ImageIcon, Check, X, Loader2 } from 'lucide-react'

interface CoverSearchProps {
  bookId: string
  isbn?: string
  title: string
  currentCover?: string
}

export default function CoverSearch({ bookId, isbn, title, currentCover }: CoverSearchProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function search() {
    setLoading(true)
    setError(null)
    setCandidates([])
    setSelected(null)
    setSaved(false)

    const results: string[] = []

    // 1. Via ISBN si disponible
    if (isbn) {
      try {
        const res = await fetch(`/api/isbn/${isbn}`)
        if (res.ok) {
          const data = await res.json()
          if (data.cover) results.push(data.cover)
        }
      } catch { /* skip */ }

      // Open Library direct par ISBN (tailles L et M)
      const olL = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
      const olM = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
      results.push(olL, olM)
    }

    // 2. Google Books par titre
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=5`
      )
      if (res.ok) {
        const json = await res.json()
        for (const item of json.items ?? []) {
          const links = item.volumeInfo?.imageLinks
          const url = links?.thumbnail ?? links?.smallThumbnail
          if (url) {
            results.push(url.replace('http://', 'https://').replace('zoom=1', 'zoom=0'))
          }
        }
      }
    } catch { /* skip */ }

    // Dédupliquer
    const unique = Array.from(new Set(results)).filter(Boolean)
    if (unique.length === 0) setError('Aucune couverture trouvée.')
    setCandidates(unique)
    setLoading(false)
    setOpen(true)
  }

  async function save() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cover: selected }),
    })
    setSaving(false)
    setSaved(true)
    // Recharge la page pour afficher la nouvelle couverture
    window.location.reload()
  }

  return (
    <div className="mt-3">
      <button
        onClick={search}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-primary hover:underline disabled:opacity-50"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
        {loading ? 'Recherche…' : currentCover ? 'Changer la couverture' : 'Rechercher une couverture'}
      </button>

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

      {open && candidates.length > 0 && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-ink-subtle">Choisissez une couverture :</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {candidates.map((url) => (
              <button
                key={url}
                onClick={() => setSelected(url === selected ? null : url)}
                className={`relative flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden border-2 transition ${
                  selected === url ? 'border-primary shadow-glow' : 'border-transparent'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-contain bg-surface-3"
                  onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none' }} />
                {selected === url && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check size={16} className="text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={!selected || saving}
              className="flex items-center gap-1.5 gradient-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition disabled:opacity-40"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Utiliser cette couverture
            </button>
            <button
              onClick={() => { setOpen(false); setCandidates([]); setSelected(null) }}
              className="text-xs text-ink-subtle hover:text-ink px-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

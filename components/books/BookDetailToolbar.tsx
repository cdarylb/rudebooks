'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ImageIcon, Edit, Check, X, Loader2, Trash2, Euro, ShoppingCart } from 'lucide-react'

interface BookDetailToolbarProps {
  bookId: string
  editHref: string
  isbn?: string
  title: string
  currentCover?: string
  initialFavorite: boolean
  initialPrice?: number
}

export default function BookDetailToolbar({
  bookId,
  editHref,
  isbn,
  title,
  currentCover,
  initialFavorite,
  initialPrice,
}: BookDetailToolbarProps) {
  const router = useRouter()
  const [favorite, setFavorite]       = useState(initialFavorite)
  const [coverOpen, setCoverOpen]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [candidates, setCandidates]   = useState<string[]>([])
  const [selected, setSelected]       = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [price, setPrice]                   = useState<number | undefined>(initialPrice)
  const [priceLoading, setPriceLoading]     = useState(false)
  const [amazonLoading, setAmazonLoading]   = useState(false)
  const [priceError, setPriceError]         = useState<string | null>(null)

  async function doFetchPrice(source: 'google' | 'amazon') {
    if (!isbn) return
    const setLoading = source === 'amazon' ? setAmazonLoading : setPriceLoading
    setLoading(true)
    setPriceError(null)
    const res = await fetch(`/api/price/${isbn}?source=${source}`)
    if (res.ok) {
      const { price: found } = await res.json()
      setPrice(found)
      await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: found }),
      })
    } else {
      const label = source === 'amazon' ? 'Amazon' : 'Google Books'
      setPriceError(`Prix introuvable sur ${label}`)
    }
    setLoading(false)
  }

  async function deleteBook() {
    setDeleting(true)
    await fetch(`/api/books/${bookId}`, { method: 'DELETE' })
    router.push('/books')
  }

  async function toggleFavorite() {
    const next = !favorite
    setFavorite(next)
    await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: next }),
    })
  }

  async function searchCovers() {
    setLoading(true)
    setError(null)
    setCandidates([])
    setSelected(null)
    const results: string[] = []

    if (isbn) {
      try {
        const res = await fetch(`/api/isbn/${isbn}`)
        if (res.ok) {
          const data = await res.json()
          if (data.cover) results.push(data.cover)
        }
      } catch { /* skip */ }
      results.push(
        `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
        `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
      )
    }

    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=5`
      )
      if (res.ok) {
        const json = await res.json()
        for (const item of json.items ?? []) {
          const links = item.volumeInfo?.imageLinks
          const url = links?.thumbnail ?? links?.smallThumbnail
          if (url) results.push(url.replace('http://', 'https://').replace('zoom=1', 'zoom=0'))
        }
      }
    } catch { /* skip */ }

    const unique = Array.from(new Set(results)).filter(Boolean)
    if (unique.length === 0) setError('Aucune couverture trouvée.')
    setCandidates(unique)
    setLoading(false)
    setCoverOpen(true)
  }

  async function saveCover() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cover: selected }),
    })
    setSaving(false)
    window.location.reload()
  }

  function closePicker() {
    setCoverOpen(false)
    setCandidates([])
    setSelected(null)
    setError(null)
  }

  return (
    <div className="space-y-3">
      {/* Toolbar row */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleFavorite}
          title={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`p-2 rounded-lg border transition ${
            favorite
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              : 'bg-surface-2 border-edge text-ink-muted hover:text-ink'
          }`}
        >
          <Heart size={17} className={favorite ? 'fill-rose-400' : ''} />
        </button>

        <button
          onClick={coverOpen ? closePicker : searchCovers}
          disabled={loading}
          title={currentCover ? 'Changer la couverture' : 'Rechercher une couverture'}
          className={`p-2 rounded-lg border transition ${
            coverOpen
              ? 'bg-primary/15 border-primary/40 text-primary'
              : 'bg-surface-2 border-edge text-ink-muted hover:text-ink disabled:opacity-50'
          }`}
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <ImageIcon size={17} />}
        </button>

        <Link
          href={editHref}
          title="Modifier"
          className="p-2 rounded-lg border bg-surface-2 border-edge text-ink-muted hover:text-ink transition"
        >
          <Edit size={17} />
        </Link>

        {isbn && (
          <>
            <button
              onClick={() => doFetchPrice('google')}
              disabled={priceLoading || amazonLoading}
              title={price != null ? `Prix Google Books : ${price} €` : 'Rechercher le prix (Google Books)'}
              className={`p-2 rounded-lg border transition ${
                price != null
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-surface-2 border-edge text-ink-muted hover:text-ink disabled:opacity-50'
              }`}
            >
              {priceLoading ? <Loader2 size={17} className="animate-spin" /> : <Euro size={17} />}
            </button>
            <button
              onClick={() => doFetchPrice('amazon')}
              disabled={priceLoading || amazonLoading}
              title="Rechercher le prix (Amazon)"
              className="p-2 rounded-lg border bg-surface-2 border-edge text-ink-muted hover:text-ink disabled:opacity-50 transition"
            >
              {amazonLoading ? <Loader2 size={17} className="animate-spin" /> : <ShoppingCart size={17} />}
            </button>
          </>
        )}

        {confirmDelete ? (
          <>
            <button
              onClick={deleteBook}
              disabled={deleting}
              title="Confirmer la suppression"
              className="p-2 rounded-lg border bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
            >
              {deleting ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              title="Annuler"
              className="p-2 rounded-lg border bg-surface-2 border-edge text-ink-muted hover:text-ink transition"
            >
              <X size={17} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            title="Supprimer le livre"
            className="p-2 rounded-lg border bg-surface-2 border-edge text-ink-muted hover:text-red-400 hover:border-red-500/30 transition"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      {/* Price feedback */}
      {priceError && <p className="text-xs text-red-400">{priceError}</p>}
      {price != null && !priceError && (
        <p className="text-xs text-emerald-400">{price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</p>
      )}

      {/* Cover picker */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {coverOpen && candidates.length > 0 && (
        <div className="glass-card rounded-xl p-3 space-y-3">
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
              onClick={saveCover}
              disabled={!selected || saving}
              className="flex items-center gap-1.5 gradient-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition disabled:opacity-40"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Utiliser cette couverture
            </button>
            <button onClick={closePicker} className="p-1.5 text-ink-subtle hover:text-ink">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

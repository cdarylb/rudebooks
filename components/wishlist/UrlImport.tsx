'use client'

import { useState } from 'react'
import { Link2, ArrowRight, AlertCircle } from 'lucide-react'
import { WishlistItemInput } from '@/lib/validators/wishlist'

interface UrlImportProps {
  onImport: (data: Partial<WishlistItemInput>) => void
}

export default function UrlImport({ onImport }: UrlImportProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        setError('Impossible d\'extraire les données de cette URL. Essayez de remplir manuellement.')
        return
      }
      const data = await res.json()
      onImport({ title: data.title || '', cover: data.cover || '', description: data.description || '',
        sourceUrl: data.sourceUrl || url, isbn: data.isbn || '', price: data.price })
    } catch {
      setError("Impossible de récupérer l'URL")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-ink-muted">
        <Link2 size={16} />
        <p className="text-sm font-medium">Collez l'URL d'une page produit</p>
      </div>
      <p className="text-xs text-ink-subtle">
        Fonctionne avec Amazon, Fnac, Decitre, et la plupart des librairies en ligne
      </p>

      <form onSubmit={handleFetch} className="flex gap-2">
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
          required placeholder="https://www.amazon.fr/…" className="field flex-1" />
        <button type="submit" disabled={loading}
          className="flex items-center gap-1.5 gradient-primary text-white text-sm font-medium px-3 py-2.5 rounded-lg transition disabled:opacity-50 flex-shrink-0">
          {loading ? '…' : <ArrowRight size={16} />}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-2 bg-red-950/50 border border-red-800/60 text-red-400 text-xs px-3 py-2 rounded-lg">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  )
}

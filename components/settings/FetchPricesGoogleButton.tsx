'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Loader2, CheckCircle } from 'lucide-react'

interface Result {
  processed: number
  found: number
  errors: number
  remaining: number
}

export default function FetchPricesGoogleButton() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    fetch('/api/admin/fetch-prices-google')
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining ?? null))
      .catch(() => {})
  }, [])

  async function run() {
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/fetch-prices-google', { method: 'POST' })
    const data: Result = await res.json()
    setResult(data)
    setRemaining(data.remaining)
    setLoading(false)
  }

  if (remaining === 0 && !result) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400">
        <CheckCircle size={13} />
        Tous les livres avec ISBN ont été vérifiés sur Google Books
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={run}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition disabled:opacity-50"
      >
        {loading
          ? <Loader2 size={12} className="animate-spin" />
          : <BookOpen size={12} />}
        {loading
          ? 'Recherche Google Books en cours…'
          : result
            ? `Relancer Google Books (${remaining} restant${remaining !== 1 ? 's' : ''})`
            : `Rechercher les prix via Google Books${remaining !== null ? ` (${remaining} livre${remaining !== 1 ? 's' : ''})` : ''}`}
      </button>

      {result && (
        <p className="text-xs text-ink-subtle">
          {result.found} prix trouvé{result.found !== 1 ? 's' : ''} sur {result.processed} traité{result.processed !== 1 ? 's' : ''}
          {result.remaining > 0 && ` — ${result.remaining} restant${result.remaining !== 1 ? 's' : ''}`}
        </p>
      )}
    </div>
  )
}

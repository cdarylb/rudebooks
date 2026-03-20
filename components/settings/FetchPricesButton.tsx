'use client'

import { useEffect, useState } from 'react'
import { Euro, Loader2, CheckCircle, ExternalLink } from 'lucide-react'

interface Result {
  processed: number
  found: number
  errors: number
  remaining: number
}

export default function FetchPricesButton() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    fetch('/api/admin/fetch-prices')
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining ?? null))
      .catch(() => {})
  }, [])

  async function run() {
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/fetch-prices', { method: 'POST' })
    const data: Result = await res.json()
    setResult(data)
    setRemaining(data.remaining)
    setLoading(false)
  }

  if (remaining === 0 && !result) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400">
        <CheckCircle size={13} />
        Tous les livres avec ISBN ont un prix
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition disabled:opacity-50"
        >
          {loading
            ? <Loader2 size={12} className="animate-spin" />
            : <Euro size={12} />}
          {loading
            ? 'Récupération en cours… (peut prendre 1-2 min)'
            : result
              ? `Relancer (${remaining} restant${remaining !== 1 ? 's' : ''})`
              : `Récupérer les prix manquants${remaining !== null ? ` (${remaining} livre${remaining !== 1 ? 's' : ''})` : ''}`}
        </button>

        {!loading && (
          <a
            href="https://www.fnac.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-ink-subtle hover:text-primary transition"
          >
            <ExternalLink size={11} />
            Fnac
          </a>
        )}
      </div>

      {result && (
        <p className="text-xs text-ink-subtle">
          {result.found} prix trouvé{result.found !== 1 ? 's' : ''} sur {result.processed} traité{result.processed !== 1 ? 's' : ''}
          {result.remaining > 0 && ` — ${result.remaining} restant${result.remaining !== 1 ? 's' : ''}`}
          {result.errors > 0 && ` (${result.errors} échec${result.errors !== 1 ? 's' : ''})`}
        </p>
      )}
    </div>
  )
}

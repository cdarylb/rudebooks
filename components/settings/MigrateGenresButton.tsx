'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle } from 'lucide-react'

export default function MigrateGenresButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [count, setCount] = useState<number | null>(null)

  async function run() {
    setState('loading')
    const res = await fetch('/api/admin/migrate-genres', { method: 'POST' })
    const data = await res.json()
    setCount(data.updated ?? 0)
    setState('done')
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400">
        <CheckCircle size={13} />
        {count === 0 ? 'Aucun livre à migrer' : `${count} livre${count! > 1 ? 's' : ''} mis à jour`}
      </div>
    )
  }

  return (
    <button
      onClick={run}
      disabled={state === 'loading'}
      className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition disabled:opacity-50"
    >
      <RefreshCw size={12} className={state === 'loading' ? 'animate-spin' : ''} />
      {state === 'loading' ? 'Migration…' : 'Migrer "Science-fiction" → "SF / Fantasy"'}
    </button>
  )
}

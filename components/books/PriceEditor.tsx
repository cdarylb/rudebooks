'use client'

import { useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'

interface PriceEditorProps {
  bookId: string
  initialPrice?: number
}

export default function PriceEditor({ bookId, initialPrice }: PriceEditorProps) {
  const [price, setPrice] = useState<number | undefined>(initialPrice)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    const parsed = parseFloat(input.replace(',', '.'))
    if (isNaN(parsed) || parsed < 0) return
    setSaving(true)
    await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: parsed }),
    })
    setPrice(parsed)
    setEditing(false)
    setSaving(false)
  }

  function startEdit() {
    setInput(price != null ? String(price) : '')
    setEditing(true)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 ml-auto">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          autoFocus
          min={0}
          step={0.01}
          placeholder="0.00"
          className="w-24 text-xs text-right bg-surface-2 border border-edge rounded-lg px-2 py-1 text-ink focus:outline-none focus:border-primary/50"
        />
        <span className="text-xs text-ink-subtle">€</span>
        <button onClick={save} disabled={saving}
          className="p-1 rounded text-emerald-400 hover:bg-emerald-500/15 transition disabled:opacity-50">
          <Check size={14} />
        </button>
        <button onClick={() => setEditing(false)}
          className="p-1 rounded text-ink-subtle hover:text-ink transition">
          <X size={14} />
        </button>
      </div>
    )
  }

  if (price != null) {
    return (
      <button onClick={startEdit}
        className="ml-auto flex items-center gap-1.5 group"
        title="Modifier le prix">
        <span className="text-sm font-semibold text-emerald-400">
          {price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
        </span>
        <Pencil size={11} className="text-ink-subtle opacity-0 group-hover:opacity-100 transition" />
      </button>
    )
  }

  return (
    <button onClick={startEdit}
      className="ml-auto text-xs text-ink-subtle hover:text-primary transition"
      title="Ajouter un prix manuellement">
      + Prix
    </button>
  )
}

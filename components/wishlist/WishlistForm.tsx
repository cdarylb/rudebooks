'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { WishlistItemInput } from '@/lib/validators/wishlist'

interface WishlistFormProps {
  initialData?: Partial<WishlistItemInput>
  onSubmit: (data: WishlistItemInput) => Promise<void>
  submitLabel?: string
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-ink-subtle uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const PRIORITY_STYLES: Record<string, string> = {
  low:    'bg-surface-3 border-edge text-ink-muted',
  medium: 'bg-primary/15 border-primary/40 text-primary',
  high:   'bg-primary/25 border-primary/60 text-primary',
}

export default function WishlistForm({ initialData, onSubmit, submitLabel = 'Ajouter à la liste' }: WishlistFormProps) {
  const [form, setForm] = useState<WishlistItemInput>({
    title:       initialData?.title ?? '',
    authors:     initialData?.authors ?? [''],
    isbn:        initialData?.isbn ?? '',
    cover:       initialData?.cover ?? '',
    description: initialData?.description ?? '',
    sourceUrl:   initialData?.sourceUrl ?? '',
    price:       initialData?.price,
    currency:    initialData?.currency ?? 'EUR',
    priority:    initialData?.priority ?? 'medium',
    notes:       initialData?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)

  function setField<K extends keyof WishlistItemInput>(field: K, value: WishlistItemInput[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ ...form, authors: form.authors?.filter(Boolean) })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.cover && (
        <div className="flex justify-center">
          <div className="relative w-20 h-28 rounded-lg overflow-hidden shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.cover} alt="Couverture" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <Field label="Titre *">
          <input type="text" value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            required className="field" placeholder="Titre du livre" />
        </Field>

        <Field label="Auteur(s)">
          {form.authors?.map((author, i) => (
            <input key={i} type="text" value={author}
              onChange={(e) => {
                const updated = [...(form.authors ?? [])]
                updated[i] = e.target.value
                setField('authors', updated)
              }}
              className={`field ${i > 0 ? 'mt-1' : ''}`}
              placeholder={`Auteur ${i + 1}`} />
          ))}
        </Field>

        <Field label="Priorité">
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button key={p} type="button" onClick={() => setField('priority', p)}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-lg border transition capitalize',
                  form.priority === p ? PRIORITY_STYLES[p] : 'bg-surface-2 border-edge text-ink-subtle'
                )}>
                {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prix">
            <input type="number" value={form.price ?? ''}
              onChange={(e) => setField('price', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="field" min={0} step={0.01} placeholder="0.00" />
          </Field>
          <Field label="Devise">
            <input type="text" value={form.currency}
              onChange={(e) => setField('currency', e.target.value)}
              className="field" placeholder="EUR" />
          </Field>
        </div>

        <Field label="Notes">
          <textarea value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            rows={2} className="field resize-none" placeholder="Notes éventuelles…" />
        </Field>
      </div>

      <button type="submit" disabled={loading}
        className="w-full gradient-primary text-white font-medium py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
        {loading ? 'Enregistrement…' : submitLabel}
      </button>
    </form>
  )
}

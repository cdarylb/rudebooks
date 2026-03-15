'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ChevronDown } from 'lucide-react'
import { BookInput } from '@/lib/validators/book'
import { GENRES, Genre } from '@/lib/genres'
import AuthorInput from './AuthorInput'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Location {
  _id: string
  name: string
  parentId?: { _id: string; name: string } | null
}

interface BookFormProps {
  initialData?: Partial<BookInput>
  onSubmit: (data: BookInput) => Promise<void>
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

export default function BookForm({ initialData, onSubmit, submitLabel = 'Ajouter le livre' }: BookFormProps) {
  const { data: locations } = useSWR<Location[]>('/api/locations', fetcher)

  const [form, setForm] = useState<BookInput>({
    title:        initialData?.title ?? '',
    authors:      initialData?.authors?.length ? initialData.authors : [''],
    isbn:         initialData?.isbn ?? '',
    cover:        initialData?.cover ?? '',
    description:  initialData?.description ?? '',
    publisher:    initialData?.publisher ?? '',
    publishedYear: initialData?.publishedYear,
    pageCount:    initialData?.pageCount,
    genres:       initialData?.genres ?? [],
    locationId:   initialData?.locationId ?? '',
    locationNote: initialData?.locationNote ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(
    !!(initialData?.pageCount || initialData?.genres?.length || initialData?.description || initialData?.publisher)
  )

  function setField<K extends keyof BookInput>(field: K, value: BookInput[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ ...form, authors: form.authors.filter(Boolean), pageCount: form.pageCount || undefined })
    setLoading(false)
  }

  const submitButton = (
    <button type="submit" disabled={loading}
      className="w-full gradient-primary text-white font-medium py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
      {loading ? 'Enregistrement…' : submitLabel}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitButton}

      {form.cover && (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.cover} alt="Couverture"
            className="w-20 h-28 object-contain rounded-lg shadow-md" />
        </div>
      )}

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <Field label="Titre *">
          <input type="text" value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            required className="field" placeholder="Titre du livre" />
        </Field>

        <Field label="Auteur(s) *">
          {form.authors.map((author, i) => (
            <AuthorInput
              key={i}
              value={author}
              onChange={(v) => {
                const updated = [...form.authors]
                updated[i] = v
                setField('authors', updated)
              }}
              placeholder={`Auteur ${i + 1}`}
              className={`field ${i > 0 ? 'mt-1' : ''}`}
            />
          ))}
          <button type="button"
            onClick={() => setField('authors', [...form.authors, ''])}
            className="text-xs text-primary mt-1 hover:underline">
            + Ajouter un auteur
          </button>
        </Field>

        <Field label="ISBN">
          <input type="text" value={form.isbn}
            onChange={(e) => setField('isbn', e.target.value)}
            className="field font-mono" placeholder="9780000000000" />
        </Field>

        <Field label="URL de couverture">
          <input type="url" value={form.cover}
            onChange={(e) => setField('cover', e.target.value)}
            className="field" placeholder="https://…" />
        </Field>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <Field label="Emplacement *">
          <select value={form.locationId}
            onChange={(e) => setField('locationId', e.target.value)}
            required
            className="field">
            <option value="">— Choisir un emplacement —</option>
            {(() => {
              if (!locations) return null
              const rooms = locations.filter((l) => !l.parentId)
              const spots = locations.filter((l) => !!l.parentId)
              const orphans = spots.filter((s) => !rooms.find((r) => r._id === s.parentId?._id))
              return (
                <>
                  {rooms.map((room) => {
                    const roomSpots = spots.filter((s) => s.parentId?._id === room._id)
                    if (roomSpots.length === 0) return null
                    return (
                      <optgroup key={room._id} label={room.name}>
                        {roomSpots.map((spot) => (
                          <option key={spot._id} value={spot._id}>{spot.name}</option>
                        ))}
                      </optgroup>
                    )
                  })}
                  {orphans.map((loc) => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
                </>
              )
            })()}
          </select>
        </Field>

        <Field label="Précision d'emplacement">
          <input type="text" value={form.locationNote}
            onChange={(e) => setField('locationNote', e.target.value)}
            className="field" placeholder="ex. 2e rangée, tranche bleue" />
        </Field>


      </div>

      <button type="button" onClick={() => setShowDetails((v) => !v)}
        className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition w-full">
        <ChevronDown size={15} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        Détails optionnels
        <span className="flex-1 h-px bg-edge ml-1" />
      </button>

      {showDetails && (
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <Field label="Description">
            <textarea value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3} className="field resize-none" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Éditeur">
              <input type="text" value={form.publisher}
                onChange={(e) => setField('publisher', e.target.value)}
                className="field" />
            </Field>
            <Field label="Année">
              <input type="number" value={form.publishedYear ?? ''}
                onChange={(e) => setField('publishedYear', e.target.value ? parseInt(e.target.value) : undefined)}
                className="field" min={1000} max={2100} />
            </Field>
          </div>

          <Field label="Pages">
            <input type="number" value={form.pageCount ?? ''}
              onChange={(e) => setField('pageCount', e.target.value ? parseInt(e.target.value) : undefined)}
              className="field" />
          </Field>

          <Field label="Genres">
            <div className="flex flex-wrap gap-1.5 mt-1">
              {GENRES.map((g) => {
                const active = form.genres?.includes(g)
                return (
                  <button key={g} type="button"
                    onClick={() => {
                      const current = form.genres ?? []
                      setField('genres', active
                        ? current.filter((x) => x !== g)
                        : [...current, g] as Genre[]
                      )
                    }}
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
          </Field>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full gradient-primary text-white font-medium py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
        {loading ? 'Enregistrement…' : submitLabel}
      </button>
    </form>
  )
}

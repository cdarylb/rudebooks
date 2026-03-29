'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/layout/PageHeader'
import BookForm from '@/components/books/BookForm'
import IsbnScanner from '@/components/books/IsbnScanner'
import { BookInput } from '@/lib/validators/book'

type Tab = 'manual' | 'scan'

export default function AddBookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'scan' ? 'scan' : 'manual')

  const lastLocationId = typeof window !== 'undefined'
    ? localStorage.getItem('lastLocationId') ?? ''
    : ''

  const [prefilled, setPrefilled] = useState<Partial<BookInput>>({ locationId: lastLocationId })
  const [formKey, setFormKey] = useState(0)

  const [isbnInput, setIsbnInput] = useState('')
  const [isbnLoading, setIsbnLoading] = useState(false)
  const [isbnError, setIsbnError] = useState<string | null>(null)

  async function lookupIsbn(isbn: string) {
    const clean = isbn.replace(/[-\s]/g, '')
    if (!clean) return
    setIsbnLoading(true)
    setIsbnError(null)
    const res = await fetch(`/api/isbn/${clean}`)
    if (res.ok) {
      const data = await res.json()
      setPrefilled({ locationId: lastLocationId, ...data })
      setFormKey((k) => k + 1)
    } else {
      setIsbnError('Aucun résultat pour cet ISBN.')
    }
    setIsbnLoading(false)
  }

  async function handleIsbnDetected(isbn: string) {
    const res = await fetch(`/api/isbn/${isbn}`)
    if (res.ok) {
      const data = await res.json()
      setPrefilled({ locationId: lastLocationId, ...data })
      setFormKey((k) => k + 1)
      setTab('manual')
    }
  }

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [pendingData, setPendingData] = useState<BookInput | null>(null)

  async function checkDuplicate(data: BookInput): Promise<string | null> {
    const q = data.isbn?.trim() || data.title?.trim()
    if (!q) return null
    const res = await fetch(`/api/books?q=${encodeURIComponent(q)}&limit=5`)
    if (!res.ok) return null
    const { books } = await res.json()
    if (!books?.length) return null
    const match = books.find((b: { isbn?: string; title: string }) =>
      (data.isbn && b.isbn === data.isbn) ||
      b.title.toLowerCase() === data.title.toLowerCase()
    )
    return match ? match.title : null
  }

  async function handleSubmit(data: BookInput) {
    setSubmitError(null)

    // Si on a déjà confirmé le doublon, on soumet directement
    if (pendingData) {
      await doSubmit(pendingData)
      return
    }

    const duplicate = await checkDuplicate(data)
    if (duplicate) {
      setDuplicateWarning(`"${duplicate}" est déjà dans votre bibliothèque.`)
      setPendingData(data)
      return
    }

    await doSubmit(data)
  }

  async function doSubmit(data: BookInput) {
    setSubmitError(null)
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      if (data.locationId) localStorage.setItem('lastLocationId', data.locationId)
      router.push('/books')
    } else {
      const err = await res.json().catch(() => ({}))
      setSubmitError(err?.error ? JSON.stringify(err.error) : 'Erreur lors de l\'enregistrement.')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Ajouter un livre" backHref="/books" />

      <div className="flex rounded-xl border border-edge bg-surface p-1 gap-1">
        {(['manual', 'scan'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition',
              tab === t ? 'gradient-primary text-white shadow-sm' : 'text-ink-muted hover:text-ink'
            )}>
            {t === 'manual' ? 'Manuel' : 'Scanner ISBN'}
          </button>
        ))}
      </div>

      {tab === 'scan' ? (
        <IsbnScanner onDetected={handleIsbnDetected} />
      ) : (
        <>
          {/* Recherche par ISBN */}
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <p className="text-xs font-medium text-ink-subtle uppercase tracking-wide">Rechercher par ISBN</p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={isbnInput}
                onChange={(e) => { setIsbnInput(e.target.value); setIsbnError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && lookupIsbn(isbnInput)}
                placeholder="9780000000000"
                className="field flex-1 font-mono"
              />
              <button
                type="button"
                onClick={() => lookupIsbn(isbnInput)}
                disabled={isbnLoading || !isbnInput.trim()}
                className="flex items-center gap-1.5 gradient-primary text-white text-sm font-medium px-4 rounded-lg hover:opacity-90 transition disabled:opacity-40"
              >
                {isbnLoading
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Search size={15} />}
                Rechercher
              </button>
            </div>
            {isbnError && (
              <p className="text-xs text-red-400">{isbnError}</p>
            )}
          </div>

          {duplicateWarning && (
            <div className="flex items-start justify-between gap-3 bg-amber-950/40 border border-amber-700/50 text-amber-400 text-sm px-3 py-2.5 rounded-lg">
              <span>{duplicateWarning} Ajouter quand même ?</span>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { setDuplicateWarning(null); setPendingData(null) }}
                  className="text-xs underline hover:no-underline">Annuler</button>
                <button onClick={() => pendingData && doSubmit(pendingData)}
                  className="text-xs font-medium underline hover:no-underline">Confirmer</button>
              </div>
            </div>
          )}
          {submitError && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">{submitError}</p>
          )}
          <BookForm key={formKey} initialData={prefilled ?? undefined} onSubmit={handleSubmit} />
        </>
      )}
    </div>
  )
}

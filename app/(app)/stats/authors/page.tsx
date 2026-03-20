'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Save, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import Spinner from '@/components/ui/Spinner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const LIMIT = 100

interface Book {
  _id: string
  title: string
  authors: string[]
}

// Clé de tri normalisée : minuscules, sans accents, sans ponctuation
function normalizeAuthor(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // suppr. accents
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')      // ponctuation → espace
    .replace(/\s+/g, ' ')
    .trim()
}

function sortKey(book: Book): string {
  const first = book.authors[0] ?? ''
  return normalizeAuthor(first)
}

export default function AuthorsHarmonizationPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, mutate } = useSWR<{ books: Book[]; total: number }>(
    `/api/books?page=${page}&limit=${LIMIT}&sort=author`,
    fetcher
  )

  // bookId -> valeur éditée (auteurs séparés par virgule)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const dirtyCount = Object.keys(edits).length
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  // Tri client-side par clé normalisée pour regrouper les variantes
  const sortedBooks = useMemo(() => {
    if (!data?.books) return []
    return [...data.books].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
  }, [data])

  function getValue(book: Book) {
    return edits[book._id] !== undefined ? edits[book._id] : book.authors.join(', ')
  }

  function handleChange(book: Book, value: string) {
    const original = book.authors.join(', ')
    if (value === original) {
      setEdits((prev) => {
        const next = { ...prev }
        delete next[book._id]
        return next
      })
    } else {
      setEdits((prev) => ({ ...prev, [book._id]: value }))
    }
  }

  function handlePageChange(next: number) {
    setPage(next)
    setEdits({})
  }

  async function save() {
    setSaving(true)
    await Promise.all(
      Object.entries(edits).map(([id, authorsStr]) => {
        const authors = authorsStr.split(',').map((a) => a.trim()).filter(Boolean)
        return fetch(`/api/books/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authors }),
        })
      })
    )
    setEdits({})
    mutate()
    setSaving(false)
  }

  // Détecte si deux lignes adjacentes partagent le même bloc d'auteur (même préfixe normalisé à 4 chars)
  function isSameGroup(a: Book, b: Book): boolean {
    const ka = sortKey(a)
    const kb = sortKey(b)
    if (!ka || !kb) return false
    const prefix = Math.min(4, Math.min(ka.length, kb.length))
    return ka.slice(0, prefix) === kb.slice(0, prefix)
  }

  return (
    <div className="space-y-4 pb-28">
      <PageHeader title="Harmonisation auteurs" backHref="/stats" />

      {isLoading || !data ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          <p className="text-xs text-ink-muted px-0.5">
            Livres triés par auteur. Les noms proches sont regroupés. Plusieurs auteurs séparés par une virgule.
          </p>

          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-edge bg-surface-2">
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-ink-muted w-[45%]">Titre</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-ink-muted">Auteurs</th>
                </tr>
              </thead>
              <tbody>
                {sortedBooks.map((book, i) => {
                  const isDirty = edits[book._id] !== undefined
                  const prev = sortedBooks[i - 1]
                  // Séparateur visuel entre groupes d'auteurs distincts
                  const groupBreak = i > 0 && prev && !isSameGroup(prev, book)
                  return (
                    <>
                      {groupBreak && (
                        <tr key={`sep-${book._id}`}>
                          <td colSpan={2} className="border-t-2 border-edge/60" />
                        </tr>
                      )}
                      <tr
                        key={book._id}
                        className={`border-t border-edge/30 ${isDirty ? 'bg-primary/5' : 'hover:bg-surface-2 transition'}`}
                      >
                        <td className="px-3 py-2">
                          <span className="text-xs text-ink line-clamp-2">{book.title}</span>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={getValue(book)}
                            onChange={(e) => handleChange(book, e.target.value)}
                            className={`w-full bg-transparent text-xs text-ink rounded-lg px-2 py-1.5 border focus:outline-none transition ${
                              isDirty
                                ? 'border-primary/50 bg-primary/5 focus:border-primary'
                                : 'border-transparent hover:border-edge focus:border-primary/40 focus:bg-surface-2'
                            }`}
                          />
                        </td>
                      </tr>
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-ink-muted px-0.5">
            <span>{data.total} livres · page {page}/{totalPages}</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-surface-2 disabled:opacity-30 transition"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-1">{page} / {totalPages}</span>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-surface-2 disabled:opacity-30 transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {dirtyCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
          <button
            onClick={save}
            disabled={saving}
            className="pointer-events-auto flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:bg-primary/90 disabled:opacity-60 transition"
          >
            <Save size={15} />
            {saving
              ? 'Enregistrement…'
              : `Enregistrer ${dirtyCount} modification${dirtyCount > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}

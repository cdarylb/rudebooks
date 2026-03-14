'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Search, X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import BookCard from './BookCard'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const LIMIT = 20

interface Book {
  _id: string
  title: string
  authors: string[]
  cover?: string
  status: 'owned' | 'lent'
  locationId?: { name: string } | null
}

export default function BookList() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  function handleSearch(q: string) {
    setQuery(q)
    setPage(1)
  }

  const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) })
  if (query) params.set('q', query)

  const { data, isLoading } = useSWR<{ books: Book[]; total: number }>(
    `/api/books?${params}`, fetcher
  )

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          type="search" value={query} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par titre, auteur, ISBN…"
          className="field pl-9 pr-9"
        />
        {query && (
          <button onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-muted">
            <X size={16} />
          </button>
        )}
      </div>

      {isLoading && <div className="flex justify-center py-12"><Spinner /></div>}

      {!isLoading && data?.books.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={query ? 'Aucun résultat' : "Aucun livre pour l'instant"}
          description={query ? 'Essayez une autre recherche' : 'Ajoutez votre premier livre'}
        />
      )}

      <div className="space-y-2">
        {data?.books.map((book) => <BookCard key={book._id} book={book} />)}
      </div>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-surface-2 transition disabled:opacity-30"
          >
            <ChevronLeft size={18} className="text-ink-muted" />
          </button>

          <p className="text-xs text-ink-subtle">
            Page {page} / {totalPages}
            <span className="text-ink-subtle/60 ml-1">({data.total} {data.total === 1 ? 'livre' : 'livres'})</span>
          </p>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-surface-2 transition disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-ink-muted" />
          </button>
        </div>
      )}
    </div>
  )
}

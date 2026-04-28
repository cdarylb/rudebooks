'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { Search, X, BookOpen, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import BookCard from './BookCard'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { GENRES } from '@/lib/genres'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const LIMIT = 20

interface Book {
  _id: string
  title: string
  authors: string[]
  cover?: string
  locationId?: { _id: string; name: string } | null
  genres?: string[]
}

interface Location {
  _id: string
  name: string
  parentId?: { _id: string; name: string } | null
}

const STORAGE_KEY = 'rudebooks:books-search'

interface SearchState {
  query: string
  page: number
  selectedGenres: string[]
  locationId: string
  noCover: boolean
  noGenre: boolean
  noLocation: boolean
  noPrice: boolean
  showFilters: boolean
}

const defaultState: SearchState = {
  query: '', page: 1, selectedGenres: [], locationId: '',
  noCover: false, noGenre: false, noLocation: false, noPrice: false, showFilters: false,
}

function loadState(searchParams: URLSearchParams): SearchState {
  // Paramètres URL prioritaires (QuickSearch, liens depuis Stats, etc.)
  const urlQ          = searchParams.get('q')
  const urlGenres     = searchParams.getAll('genre')
  const urlLocationId = searchParams.get('locationId') ?? ''
  const urlNoCover    = searchParams.get('noCover') === '1'
  const urlNoGenre    = searchParams.get('noGenre') === '1'
  const urlNoLocation = searchParams.get('noLocation') === '1'
  const urlNoPrice    = searchParams.get('noPrice') === '1'

  if (urlQ || urlGenres.length || urlLocationId || urlNoCover || urlNoGenre || urlNoLocation || urlNoPrice) {
    return {
      ...defaultState,
      query: urlQ ?? '',
      selectedGenres: urlGenres,
      locationId: urlLocationId,
      noCover: urlNoCover,
      noGenre: urlNoGenre,
      noLocation: urlNoLocation,
      noPrice: urlNoPrice,
      showFilters: urlGenres.length > 0 || !!urlLocationId || urlNoCover || urlNoGenre || urlNoLocation || urlNoPrice,
    }
  }

  // Sinon, restaurer depuis sessionStorage
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) return { ...defaultState, ...JSON.parse(saved) }
  } catch { /* ignore */ }

  return defaultState
}

export default function BookList() {
  const searchParams = useSearchParams()

  // Lazy init : sessionStorage n'est accessible que côté client
  const [state, setStateRaw] = useState<SearchState>(defaultState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!hydrated) {
      setStateRaw(loadState(searchParams))
      setHydrated(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { query, page, selectedGenres, locationId, noCover, noGenre, noLocation, noPrice, showFilters } = state

  function setState(patch: Partial<SearchState>) {
    setStateRaw((prev) => ({ ...prev, ...patch }))
  }

  const setQuery        = (query: string)          => setState({ query, page: 1 })
  const setPage         = (page: number)            => setState({ page })
  const setLocationId   = (locationId: string)      => setState({ locationId, page: 1 })
  const setNoCover      = (noCover: boolean)        => setState({ noCover, page: 1 })
  const setNoGenre      = (noGenre: boolean)        => setState({ noGenre, page: 1 })
  const setNoLocation   = (noLocation: boolean)     => setState({ noLocation, page: 1 })
  const setNoPrice      = (noPrice: boolean)        => setState({ noPrice, page: 1 })
  const setShowFilters  = (showFilters: boolean)    => setState({ showFilters })

  const { data: locations } = useSWR<Location[]>('/api/locations', fetcher)

  // Persiste dans sessionStorage à chaque changement (après hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* ignore */ }
  }, [state, hydrated])

  function toggleGenre(g: string) {
    const next = selectedGenres.includes(g)
      ? selectedGenres.filter((x) => x !== g)
      : [...selectedGenres, g]
    setState({ selectedGenres: next, page: 1 })
  }
  function clearFilters() {
    setState({ selectedGenres: [], locationId: '', noCover: false, noGenre: false, noLocation: false, noPrice: false, page: 1 })
  }

  const apiParams = new URLSearchParams({ limit: String(LIMIT), page: String(page) })
  if (query) apiParams.set('q', query)
  if (locationId) apiParams.set('locationId', locationId)
  selectedGenres.forEach((g) => apiParams.append('genre', g))
  if (noCover) apiParams.set('noCover', '1')
  if (noGenre) apiParams.set('noGenre', '1')
  if (noLocation) apiParams.set('noLocation', '1')
  if (noPrice) apiParams.set('noPrice', '1')

  const { data, isLoading } = useSWR<{ books: Book[]; total: number }>(
    `/api/books?${apiParams}`, fetcher
  )
  const { data: readingList } = useSWR<{ bookId: { _id: string } }[]>('/api/reading-list', fetcher)
  const readingSet = new Set(readingList?.map((i) => i.bookId?._id) ?? [])

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1
  const hasActiveFilters = selectedGenres.length > 0 || !!locationId || noCover || noGenre || noLocation || noPrice
  const rooms = locations?.filter((l) => !l.parentId) ?? []
  const spots = locations?.filter((l) => !!l.parentId) ?? []

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par titre, auteur, ISBN…"
          className="field pl-9 pr-9"
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-muted">
            <X size={16} />
          </button>
        )}
      </div>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
          showFilters || hasActiveFilters
            ? 'bg-primary/15 border-primary/40 text-primary'
            : 'bg-surface-2 border-edge text-ink-muted hover:text-ink'
        }`}
      >
        <SlidersHorizontal size={13} />
        Filtres
        {hasActiveFilters && (
          <span className="ml-0.5 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {selectedGenres.length + (locationId ? 1 : 0) + (noCover ? 1 : 0) + (noGenre ? 1 : 0) + (noLocation ? 1 : 0) + (noPrice ? 1 : 0)}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="glass-card rounded-xl p-3 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wide">Emplacement</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)}
              className="field text-sm">
              <option value="">Tous les emplacements</option>
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
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Sans couverture', active: noCover, toggle: () => setNoCover(!noCover) },
              { label: 'Genre non renseigné', active: noGenre, toggle: () => setNoGenre(!noGenre) },
              { label: 'Sans emplacement', active: noLocation, toggle: () => setNoLocation(!noLocation) },
              { label: 'Sans prix', active: noPrice, toggle: () => setNoPrice(!noPrice) },
            ].map(({ label, active, toggle }) => (
              <button key={label} type="button" onClick={toggle}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${
                  active
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-surface-2 border-edge text-ink-subtle hover:border-primary/30 hover:text-ink'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wide">Genres</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => {
                const active = selectedGenres.includes(g)
                return (
                  <button key={g} type="button" onClick={() => toggleGenre(g)}
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
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-ink-muted hover:text-ink underline">
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {isLoading && <div className="flex justify-center py-12"><Spinner /></div>}

      {!isLoading && data?.books.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={query || hasActiveFilters ? 'Aucun résultat' : "Aucun livre pour l'instant"}
          description={query || hasActiveFilters ? 'Essayez une autre recherche' : 'Ajoutez votre premier livre'}
        />
      )}

      <div className="space-y-2">
        {data?.books.map((book) => (
          <BookCard key={book._id} book={book} inReadingList={readingSet.has(book._id)} />
        ))}
      </div>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between pt-1">
          <button onClick={() => setPage(page - 1)} disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-surface-2 transition disabled:opacity-30">
            <ChevronLeft size={18} className="text-ink-muted" />
          </button>
          <p className="text-xs text-ink-subtle">
            Page {page} / {totalPages}
            <span className="text-ink-subtle/60 ml-1">({data.total} {data.total === 1 ? 'livre' : 'livres'})</span>
          </p>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-surface-2 transition disabled:opacity-30">
            <ChevronRight size={18} className="text-ink-muted" />
          </button>
        </div>
      )}
    </div>
  )
}

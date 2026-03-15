'use client'

import { useState, useRef, useEffect } from 'react'
import useSWR from 'swr'
import { MapPin } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Location {
  _id: string
  name: string
  parentId?: { _id: string; name: string } | null
}

interface QuickLocationPickerProps {
  bookId: string
  onSaved: (location: { _id: string; name: string }) => void
}

export default function QuickLocationPicker({ bookId, onSaved }: QuickLocationPickerProps) {
  const [open, setOpen]     = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: locations } = useSWR<Location[]>('/api/locations', fetcher)

  // Ferme le menu au clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function pick(location: Location) {
    setSaving(true)
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId: location._id }),
    })
    if (res.ok) {
      onSaved({ _id: location._id, name: location.name })
    }
    setSaving(false)
    setOpen(false)
  }

  const rooms = locations?.filter((l) => !l.parentId) ?? []
  const spots = locations?.filter((l) => !!l.parentId) ?? []

  return (
    <div ref={ref} className="relative" onClick={(e) => e.preventDefault()}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        disabled={saving}
        title="Attribuer un emplacement"
        className="flex items-center gap-1 text-xs text-ink-subtle hover:text-primary border border-dashed border-edge hover:border-primary/50 rounded-lg px-2 py-1 transition disabled:opacity-50"
      >
        <MapPin size={11} />
        <span>Emplacement</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-surface-2 border border-edge rounded-xl shadow-card-hover py-1 min-w-44 max-h-64 overflow-y-auto">
          {rooms.length === 0 && (
            <p className="text-xs text-ink-subtle px-3 py-2">Aucun emplacement défini</p>
          )}
          {rooms.map((room) => {
            const roomSpots = spots.filter((s) => s.parentId?._id === room._id)
            if (roomSpots.length === 0) return null
            return (
              <div key={room._id}>
                <p className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide px-3 pt-2 pb-1">
                  {room.name}
                </p>
                {roomSpots.map((spot) => (
                  <button
                    key={spot._id}
                    onClick={(e) => { e.stopPropagation(); pick(spot) }}
                    className="w-full text-left text-sm text-ink px-3 py-1.5 hover:bg-surface-3 transition"
                  >
                    {spot.name}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

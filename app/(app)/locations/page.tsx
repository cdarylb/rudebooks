'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, MapPin, Home, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Location {
  _id: string
  name: string
  description?: string
  parentId?: { _id: string; name: string } | null
}

const ROOMS = ['Salon', 'Chambre', 'Bureau', 'Cuisine', 'Couloir', 'Cave', 'Grenier', 'Autre']

export default function LocationsPage() {
  const { data = [], mutate } = useSWR<Location[]>('/api/locations', fetcher)

  const rooms = data.filter((l) => !l.parentId)
  const spots = data.filter((l) => !!l.parentId)

  const [addingRoom, setAddingRoom] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomDescription, setRoomDescription] = useState('')

  const [addingSpotFor, setAddingSpotFor] = useState<string | null>(null)
  const [spotName, setSpotName] = useState('')

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleAddRoom(e: React.FormEvent) {
    e.preventDefault()
    if (!roomName.trim()) return
    await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName.trim(), description: roomDescription.trim() || undefined }),
    })
    setRoomName('')
    setRoomDescription('')
    setAddingRoom(false)
    mutate()
  }

  async function handleAddSpot(e: React.FormEvent, roomId: string) {
    e.preventDefault()
    if (!spotName.trim()) return
    await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: spotName.trim(), parentId: roomId }),
    })
    setSpotName('')
    setAddingSpotFor(null)
    mutate()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/locations/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Emplacements" subtitle="Pièces et rangements de votre maison" />

      {/* Liste des pièces */}
      <div className="space-y-2">
        {rooms.map((room) => {
          const roomSpots = spots.filter((s) => s.parentId?._id === room._id)
          const isExpanded = expanded[room._id] ?? true

          return (
            <div key={room._id} className="glass-card rounded-2xl overflow-hidden">
              {/* En-tête pièce */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggle(room._id)}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <Home size={15} className="text-primary flex-shrink-0" />
                  <span className="font-medium text-sm text-ink truncate">{room.name}</span>
                  {roomSpots.length > 0 && (
                    <span className="text-xs text-ink-muted">({roomSpots.length})</span>
                  )}
                  {isExpanded
                    ? <ChevronDown size={14} className="text-ink-subtle ml-auto" />
                    : <ChevronRight size={14} className="text-ink-subtle ml-auto" />
                  }
                </button>
                <button
                  onClick={() => {
                    setAddingSpotFor(room._id)
                    setExpanded((prev) => ({ ...prev, [room._id]: true }))
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
                >
                  <Plus size={12} /> Emplacement
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="p-1.5 rounded-lg hover:bg-red-950/40 text-ink-subtle hover:text-red-400 transition flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Spots + formulaire */}
              {isExpanded && (
                <div className="border-t border-edge/50">
                  {roomSpots.map((spot) => (
                    <div key={spot._id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2/50 transition">
                      <MapPin size={13} className="text-ink-subtle flex-shrink-0 ml-1" />
                      <span className="text-sm text-ink-muted flex-1">{spot.name}</span>
                      <button
                        onClick={() => handleDelete(spot._id)}
                        className="p-1 rounded hover:bg-red-950/40 text-ink-subtle hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {addingSpotFor === room._id && (
                    <form onSubmit={(e) => handleAddSpot(e, room._id)}
                      className="flex gap-2 px-4 py-3 bg-surface-2/40">
                      <input
                        autoFocus
                        type="text"
                        value={spotName}
                        onChange={(e) => setSpotName(e.target.value)}
                        placeholder="ex. Étagère gauche"
                        required
                        className="field flex-1 text-sm py-1.5"
                      />
                      <button type="submit"
                        className="gradient-primary text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition">
                        OK
                      </button>
                      <button type="button"
                        onClick={() => { setAddingSpotFor(null); setSpotName('') }}
                        className="text-sm text-ink-subtle px-2 hover:text-ink transition">
                        ✕
                      </button>
                    </form>
                  )}

                  {roomSpots.length === 0 && addingSpotFor !== room._id && (
                    <p className="text-xs text-ink-subtle px-4 py-2.5 italic">Aucun emplacement — ajoutez-en un.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {rooms.length === 0 && !addingRoom && (
          <p className="text-center text-sm text-ink-subtle py-8">
            Aucune pièce pour l&apos;instant — commencez par en ajouter une.
          </p>
        )}
      </div>

      {/* Formulaire ajout pièce */}
      {addingRoom ? (
        <form onSubmit={handleAddRoom} className="glass-card rounded-2xl p-4 space-y-3">
          <p className="font-medium text-sm text-ink">Nouvelle pièce</p>

          <div className="flex flex-wrap gap-2">
            {ROOMS.map((r) => (
              <button key={r} type="button"
                onClick={() => setRoomName(r)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  roomName === r
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-surface-2 border-edge text-ink-muted hover:border-primary/30'
                }`}>
                {r}
              </button>
            ))}
          </div>

          <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)}
            placeholder="Nom de la pièce" required className="field" />
          <input type="text" value={roomDescription} onChange={(e) => setRoomDescription(e.target.value)}
            placeholder="Description (optionnel)" className="field" />

          <div className="flex gap-2">
            <button type="submit"
              className="flex items-center gap-1.5 gradient-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition">
              <Plus size={14} /> Créer la pièce
            </button>
            <button type="button" onClick={() => { setAddingRoom(false); setRoomName('') }}
              className="text-sm text-ink-subtle px-3 py-2 rounded-lg hover:bg-surface-2 transition">
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAddingRoom(true)}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-edge rounded-2xl py-3 text-sm text-ink-subtle hover:border-primary/40 hover:text-primary transition">
          <Plus size={15} /> Ajouter une pièce
        </button>
      )}
    </div>
  )
}

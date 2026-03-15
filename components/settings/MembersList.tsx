'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface Member {
  userId: string
  role: 'admin' | 'member'
  name: string
  email: string
}

interface MembersListProps {
  members: Member[]
  currentUserId: string
  isAdmin: boolean
}

export default function MembersList({ members, currentUserId, isAdmin }: MembersListProps) {
  const [list, setList] = useState(members)
  const [removing, setRemoving] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function remove(userId: string) {
    setRemoving(userId)
    const res = await fetch(`/api/libraries/members/${userId}`, { method: 'DELETE' })
    if (res.ok) {
      setList((prev) => prev.filter((m) => m.userId !== userId))
    }
    setRemoving(null)
    setConfirmId(null)
  }

  return (
    <div className="space-y-2">
      {list.map((m) => {
        const isSelf = m.userId === currentUserId
        const isConfirming = confirmId === m.userId
        return (
          <div key={m.userId} className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {m.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {m.name}
                {isSelf && <span className="ml-1.5 text-xs text-ink-subtle">(vous)</span>}
              </p>
              <p className="text-xs text-ink-muted truncate">{m.email}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
              m.role === 'admin'
                ? 'bg-primary/15 text-primary'
                : 'bg-surface-3 text-ink-muted'
            }`}>
              {m.role === 'admin' ? 'Admin' : 'Membre'}
            </span>

            {isAdmin && !isSelf && (
              isConfirming ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => remove(m.userId)}
                    disabled={removing === m.userId}
                    className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded-lg bg-red-950/40 border border-red-800/40 transition disabled:opacity-50"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs text-ink-muted hover:text-ink px-2 py-1"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(m.userId)}
                  className="p-1.5 text-ink-subtle hover:text-red-400 transition flex-shrink-0"
                  title="Retirer ce membre"
                >
                  <Trash2 size={14} />
                </button>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}

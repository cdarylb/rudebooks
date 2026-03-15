'use client'

import { useState } from 'react'
import { BookMarked } from 'lucide-react'

interface ReadingListButtonProps {
  bookId: string
  initialInList: boolean
}

export default function ReadingListButton({ bookId, initialInList }: ReadingListButtonProps) {
  const [inList, setInList] = useState(initialInList)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const method = inList ? 'DELETE' : 'POST'
    const res = await fetch(`/api/reading-list/${bookId}`, { method })
    if (res.ok) setInList((v) => !v)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition disabled:opacity-50 ${
        inList
          ? 'bg-primary/15 border-primary/40 text-primary'
          : 'bg-surface-2 border-edge text-ink-muted hover:text-ink hover:border-edge/80'
      }`}
    >
      <BookMarked size={15} className={inList ? 'fill-primary/30' : ''} />
      {inList ? 'Dans ma liste' : 'À lire'}
    </button>
  )
}

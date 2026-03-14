'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/layout/PageHeader'
import WishlistForm from '@/components/wishlist/WishlistForm'
import UrlImport from '@/components/wishlist/UrlImport'
import { WishlistItemInput } from '@/lib/validators/wishlist'

type Tab = 'manual' | 'url'

export default function AddWishlistPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('manual')
  const [prefilled, setPrefilled] = useState<Partial<WishlistItemInput> | null>(null)

  function handleUrlImport(data: Partial<WishlistItemInput>) {
    setPrefilled(data)
    setTab('manual')
  }

  async function handleSubmit(data: WishlistItemInput) {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) router.push('/wishlist')
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Ajouter à la liste" backHref="/wishlist" />

      <div className="flex rounded-xl border border-edge bg-surface p-1 gap-1">
        {(['manual', 'url'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition',
              tab === t ? 'gradient-primary text-white shadow-sm' : 'text-ink-muted hover:text-ink'
            )}>
            {t === 'manual' ? 'Manuel' : 'Depuis une URL'}
          </button>
        ))}
      </div>

      {tab === 'url'
        ? <UrlImport onImport={handleUrlImport} />
        : <WishlistForm initialData={prefilled ?? undefined} onSubmit={handleSubmit} />}
    </div>
  )
}

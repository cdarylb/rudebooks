import Link from 'next/link'
import { Plus } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import WishlistList from '@/components/wishlist/WishlistList'

export default function WishlistPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Liste de souhaits"
        action={
          <Link
            href="/wishlist/add"
            className="flex items-center gap-1.5 gradient-primary text-white text-sm font-medium px-3 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={16} />
            Ajouter
          </Link>
        }
      />
      <WishlistList />
    </div>
  )
}

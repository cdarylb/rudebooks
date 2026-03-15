import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ScanLine, Plus, Heart } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import StatsGrid from '@/components/dashboard/StatsGrid'
import RecentBooks from '@/components/dashboard/RecentBooks'
import WishlistPreview from '@/components/dashboard/WishlistPreview'
import QuickSearch from '@/components/dashboard/QuickSearch'
import ReadingListPreview from '@/components/dashboard/ReadingListPreview'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${session?.user?.name?.split(' ')[0]}`}
        subtitle="Votre bibliothèque en un coup d'œil"
      />

      <QuickSearch />

      <div className="grid grid-cols-3 gap-2">
        <Link href="/books/add?tab=scan"
          className="glass-card rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-primary/40 transition">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <ScanLine size={18} className="text-primary" />
          </div>
          <span className="text-xs font-medium text-ink text-center leading-tight">Scanner un ISBN</span>
        </Link>
        <Link href="/books/add"
          className="glass-card rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-primary/40 transition">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Plus size={18} className="text-primary" />
          </div>
          <span className="text-xs font-medium text-ink text-center leading-tight">Ajouter un livre</span>
        </Link>
        <Link href="/wishlist/add"
          className="glass-card rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-primary/40 transition">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Heart size={18} className="text-primary" />
          </div>
          <span className="text-xs font-medium text-ink text-center leading-tight">Ajouter un souhait</span>
        </Link>
      </div>

      <StatsGrid />
      <ReadingListPreview />
      <RecentBooks />
      <WishlistPreview />
    </div>
  )
}

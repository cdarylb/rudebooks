import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ScanLine, Plus } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import StatsGrid from '@/components/dashboard/StatsGrid'
import RecentBooks from '@/components/dashboard/RecentBooks'
import WishlistPreview from '@/components/dashboard/WishlistPreview'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${session?.user?.name?.split(' ')[0]}`}
        subtitle="Votre bibliothèque en un coup d'œil"
      />

      <div className="grid grid-cols-2 gap-3">
        <Link href="/books/add?tab=scan"
          className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 transition">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <ScanLine size={18} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-ink">Scanner un ISBN</span>
        </Link>
        <Link href="/books/add"
          className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 transition">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Plus size={18} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-ink">Ajouter un livre</span>
        </Link>
      </div>

      <StatsGrid />
      <RecentBooks />
      <WishlistPreview />
    </div>
  )
}

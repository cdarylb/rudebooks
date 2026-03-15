import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Library from '@/models/Library'
import User from '@/models/User'
import PageHeader from '@/components/layout/PageHeader'
import { MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import InviteCode from '@/components/settings/InviteCode'
import MembersList from '@/components/settings/MembersList'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  await dbConnect()
  const sessionUser = session.user as { libraryId: string; id: string; role: string }
  const libraryId = sessionUser.libraryId
  const library = await Library.findById(libraryId).lean()

  // Populate members with user names
  const memberIds = library?.members.map((m) => m.userId) ?? []
  const users = await User.find({ _id: { $in: memberIds } }).select('name email').lean()
  const usersById = Object.fromEntries(users.map((u) => [u._id.toString(), u]))

  return (
    <div className="space-y-4">
      <PageHeader title="Réglages" />

      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="font-heading font-semibold text-ink">Bibliothèque</h3>
        <div>
          <p className="text-xs text-ink-subtle mb-1">Nom</p>
          <p className="text-sm font-medium text-ink">{library?.name}</p>
        </div>
        {sessionUser.role === 'admin' && (
          <div>
            <p className="text-xs text-ink-subtle mb-1">Code d'invitation</p>
            <InviteCode code={library?.inviteCode ?? ''} />
            <p className="text-xs text-ink-subtle mt-1">
              Partagez ce code pour inviter d'autres personnes
            </p>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="font-heading font-semibold text-ink">
          Membres ({library?.members.length ?? 0})
        </h3>
        <MembersList
          currentUserId={sessionUser.id}
          isAdmin={sessionUser.role === 'admin'}
          members={(library?.members ?? []).map((m) => {
            const user = usersById[m.userId.toString()]
            return {
              userId: m.userId.toString(),
              role: m.role as 'admin' | 'member',
              name: user?.name ?? '—',
              email: user?.email ?? '',
            }
          })}
        />
      </div>

      <Link href="/locations"
        className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
        <div className="w-9 h-9 rounded-xl bg-surface-3 border border-edge flex items-center justify-center flex-shrink-0">
          <MapPin size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">Emplacements</p>
          <p className="text-xs text-ink-muted">Gérer les endroits où sont rangés les livres</p>
        </div>
        <ChevronRight size={16} className="text-ink-subtle" />
      </Link>
    </div>
  )
}

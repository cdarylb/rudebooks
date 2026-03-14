import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Library from '@/models/Library'
import PageHeader from '@/components/layout/PageHeader'
import { Copy, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  await dbConnect()
  const libraryId = (session.user as { libraryId: string }).libraryId
  const library = await Library.findById(libraryId).lean()

  return (
    <div className="space-y-4">
      <PageHeader title="Réglages" />

      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="font-heading font-semibold text-ink">Bibliothèque</h3>
        <div>
          <p className="text-xs text-ink-subtle mb-1">Nom</p>
          <p className="text-sm font-medium text-ink">{library?.name}</p>
        </div>
        <div>
          <p className="text-xs text-ink-subtle mb-1">Code d'invitation</p>
          <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2 border border-edge">
            <code className="font-mono text-sm text-primary flex-1">{library?.inviteCode}</code>
            <button className="text-ink-subtle hover:text-ink transition">
              <Copy size={14} />
            </button>
          </div>
          <p className="text-xs text-ink-subtle mt-1">
            Partagez ce code pour inviter d'autres personnes dans votre bibliothèque
          </p>
        </div>
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

      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="font-heading font-semibold text-ink">
          Membres ({library?.members.length ?? 0})
        </h3>
        <div className="space-y-2">
          {library?.members.map((m) => (
            <div key={m.userId.toString()} className="flex items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                ?
              </div>
              <div className="flex-1">
                <p className="text-sm text-ink-muted">{m.userId.toString()}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                m.role === 'admin'
                  ? 'bg-primary/15 text-primary'
                  : 'bg-surface-3 text-ink-muted'
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

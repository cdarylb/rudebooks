'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, BookOpenText, BookMarked, Heart, MapPin, Settings, LogOut, Menu, X, BarChart2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Accueil' },
  { href: '/books',        icon: BookOpenText,    label: 'Livres' },
  { href: '/reading-list', icon: BookMarked,      label: 'À lire' },
  { href: '/wishlist',     icon: Heart,           label: 'Souhaits' },
  { href: '/locations',    icon: MapPin,          label: 'Emplacements' },
  { href: '/stats',        icon: BarChart2,       label: 'Statistiques' },
  { href: '/settings',     icon: Settings,        label: 'Réglages' },
]

export default function TopBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-edge">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <BookOpen size={20} className="text-primary" />
          <span className="font-heading font-bold text-ink">RudeBooks</span>
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg hover:bg-surface-2 transition text-ink-muted hover:text-ink"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-14 right-0 left-0 z-40 bg-surface/95 backdrop-blur-md border-b border-edge shadow-card-hover">
            <div className="max-w-2xl mx-auto px-4 py-3 space-y-1">
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                      active
                        ? 'bg-primary/15 text-primary'
                        : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                    )}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                )
              })}

              <div className="border-t border-edge pt-2 mt-2">
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-ink truncate">{session?.user?.name}</p>
                  <p className="text-xs text-ink-muted truncate">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/signin' })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink-muted hover:bg-surface-2 hover:text-ink transition"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}

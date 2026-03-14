'use client'

import { useSession, signOut } from 'next-auth/react'
import { BookOpen, LogOut } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function TopBar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-edge">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          <span className="font-heading font-bold text-ink">RudeBooks</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold"
          >
            {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-20 bg-surface-2 border border-edge rounded-xl shadow-card-hover py-1 min-w-40 animate-fade-in">
                <div className="px-3 py-2 border-b border-edge">
                  <p className="text-xs font-medium text-ink truncate">{session?.user?.name}</p>
                  <p className="text-xs text-ink-muted truncate">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/signin' })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-3 transition"
                >
                  <LogOut size={14} />
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

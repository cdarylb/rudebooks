'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Heart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { href: '/books',     icon: BookOpen,         label: 'Livres' },
  { href: '/wishlist',  icon: Heart,            label: 'Souhaits' },
  { href: '/settings',  icon: Settings,         label: 'Réglages' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-t border-edge bottom-safe">
      <div className="max-w-2xl mx-auto px-2 flex">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition',
                active ? 'text-primary' : 'text-ink-subtle hover:text-ink-muted'
              )}
            >
              <Icon size={22} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

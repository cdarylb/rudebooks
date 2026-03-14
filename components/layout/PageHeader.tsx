import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, backHref, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2 pt-1">
      <div className="flex items-center gap-2 min-w-0">
        {backHref && (
          <Link href={backHref}
            className="p-1.5 rounded-lg hover:bg-surface-2 transition flex-shrink-0 -ml-1.5">
            <ChevronLeft size={20} className="text-ink-muted" />
          </Link>
        )}
        <div className="min-w-0">
          {title && (
            <h1 className="font-heading text-2xl font-bold text-ink leading-tight truncate">
              {title}
            </h1>
          )}
          {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

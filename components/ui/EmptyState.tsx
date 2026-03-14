import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-edge flex items-center justify-center mb-4">
        <Icon size={24} className="text-ink-subtle" />
      </div>
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted mt-1">{description}</p>}
    </div>
  )
}

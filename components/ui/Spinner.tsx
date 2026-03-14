import { cn } from '@/lib/utils'

export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn(
      'w-6 h-6 rounded-full border-2 border-edge border-t-primary animate-spin',
      className
    )} />
  )
}

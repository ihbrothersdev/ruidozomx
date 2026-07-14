import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

/**
 * EmptyState — a blank filing card: dashed ink border, optional icon and a
 * call to action. Replaces the scattered dashed-border empty `Card`s.
 */
export function EmptyState({
  icon: Icon,
  children,
  action,
  className
}: {
  icon?: LucideIcon
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-admin-ink/25 bg-admin-surface/40 flex flex-col items-center gap-4 border-2 border-dashed px-6 py-14 text-center',
        className
      )}
    >
      {Icon && <Icon className='text-admin-ink/25 h-8 w-8' />}
      <div className='font-pt-mono text-admin-ink-soft text-sm'>{children}</div>
      {action}
    </div>
  )
}

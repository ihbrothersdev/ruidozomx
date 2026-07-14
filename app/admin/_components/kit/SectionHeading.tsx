import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

/**
 * SectionHeading — a ruled section marker. A small stamped icon chip, a mono
 * title and an optional description, over a sprocket-tape rule. Replaces the
 * per-page `SectionHeader`/`SectionLabel` copies.
 */
export function SectionHeading({
  icon: Icon,
  title,
  description,
  action,
  className
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-4', className)}>
      <div className='flex items-end justify-between gap-3'>
        <div className='flex items-center gap-2.5'>
          {Icon && (
            <span className='border-admin-ink bg-admin-ink text-admin-paper flex h-7 w-7 shrink-0 items-center justify-center border-2'>
              <Icon className='h-3.5 w-3.5' />
            </span>
          )}
          <div>
            <h2 className='font-pt-mono text-admin-ink text-sm font-bold tracking-[0.18em] uppercase'>{title}</h2>
            {description && <p className='font-pt-mono text-admin-ink-faint text-[11px]'>{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className='admin-sprocket mt-2' />
    </div>
  )
}

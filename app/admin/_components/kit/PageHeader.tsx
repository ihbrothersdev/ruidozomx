import { cn } from '@/lib/utils'
import { LabelTag } from './LabelTag'

/**
 * PageHeader — the masthead of every admin section. Dymo eyebrow, oversized
 * BabyDoll title with a red print rule, optional lede and a right-aligned
 * action slot.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className
}: {
  eyebrow: string
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className='min-w-0'>
        <LabelTag tone='red'>{eyebrow}</LabelTag>
        <h1 className='font-baby-doll text-admin-ink mt-3 text-4xl leading-[0.85] font-bold tracking-wide uppercase sm:text-6xl'>
          {title}
        </h1>
        <div className='bg-admin-red mt-2 h-[3px] w-24' />
        {description && (
          <p className='font-pt-mono text-admin-ink-soft mt-3 max-w-2xl text-sm leading-relaxed'>{description}</p>
        )}
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </header>
  )
}

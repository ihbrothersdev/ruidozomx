import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { Tone } from './tones'
import { TONE } from './tones'

/**
 * Notice — a tacked-up note / caution slip. Ink border with a tone-tinted wash
 * and left spine. Replaces the many shadcn `Alert` banners across the admin
 * (missing MP3, over limit, "aceptando para", empty-with-cta, etc).
 */
export function Notice({
  tone = 'ink',
  icon: Icon,
  title,
  children,
  action,
  className
}: {
  tone?: Tone
  icon?: LucideIcon
  title?: React.ReactNode
  children?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  const t = TONE[tone]
  return (
    <div className={cn('border-admin-ink relative flex gap-3 border-2 py-4 pr-4 pl-5', t.fill, className)}>
      <span
        aria-hidden
        className={cn('absolute top-0 left-0 h-full w-1.5', t.solid)}
      />
      {Icon && (
        <span className={cn('mt-0.5 shrink-0', t.text)}>
          <Icon className='h-4 w-4' />
        </span>
      )}
      <div className='min-w-0 flex-1'>
        {title && <p className={cn('font-pt-mono text-xs font-bold tracking-[0.1em] uppercase', t.text)}>{title}</p>}
        {children && (
          <div className='font-pt-mono text-admin-ink-soft mt-1 text-[12px] leading-relaxed'>{children}</div>
        )}
        {action && <div className='mt-3'>{action}</div>}
      </div>
    </div>
  )
}

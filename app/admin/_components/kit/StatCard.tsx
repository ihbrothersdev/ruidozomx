import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Paper } from './Paper'
import type { Tone } from './tones'
import { TONE } from './tones'

/**
 * StatCard — a headline metric printed on an index card, with a tape-deck VU
 * meter along the base tinted by tone. Replaces the duplicated `BigStat` /
 * `Figure` cards across metrics, donations and the dashboard.
 */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'ink',
  meter
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon?: LucideIcon
  tone?: Tone
  meter?: number
}) {
  const t = TONE[tone]
  const segments = 14
  const lit = meter != null ? Math.round(Math.max(0, Math.min(1, meter)) * segments) : 0

  return (
    <Paper className='flex h-full flex-col p-4'>
      <div className='flex items-start justify-between gap-2'>
        <p className='font-pt-mono text-admin-ink-soft text-[10px] font-bold tracking-[0.2em] uppercase'>{label}</p>
        {Icon && (
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center border-2', t.border, t.text)}>
            <Icon className='h-3.5 w-3.5' />
          </span>
        )}
      </div>

      <p className='font-baby-doll text-admin-ink mt-2 text-4xl leading-none font-bold tracking-wide uppercase'>
        {value}
      </p>

      {sub && <p className='font-pt-mono text-admin-ink-faint mt-auto pt-2 text-[11px]'>{sub}</p>}

      {meter != null && (
        <div
          className='mt-3 flex gap-[3px]'
          aria-hidden
        >
          {Array.from({ length: segments }).map((_, i) => (
            <span
              key={i}
              className={cn('h-2.5 flex-1', i < lit ? t.solid : 'bg-admin-ink/12')}
            />
          ))}
        </div>
      )}
    </Paper>
  )
}

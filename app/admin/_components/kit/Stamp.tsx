import { cn } from '@/lib/utils'
import type { Tone } from './tones'
import { TONE } from './tones'

/**
 * Stamp — a rubber-stamp verdict mark (APROBADO / PENDIENTE / RECHAZADO /
 * ACTIVO …). Slightly rotated ink-bleed outline; replaces the old pill badges.
 */
export function Stamp({
  children,
  tone = 'ink',
  rotate = true,
  className
}: {
  children: React.ReactNode
  tone?: Tone
  rotate?: boolean
  className?: string
}) {
  return (
    <span className={cn('admin-stamp text-[10px]', TONE[tone].text, rotate ? '-rotate-3' : undefined, className)}>
      {children}
    </span>
  )
}

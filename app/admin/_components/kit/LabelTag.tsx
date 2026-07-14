import { cn } from '@/lib/utils'
import type { Tone } from './tones'
import { TONE } from './tones'

/**
 * LabelTag — a Dymo/label-maker strip. The admin's eyebrow + section marker,
 * replacing the old red mono uppercase text with an embossed printed tag.
 */
export function LabelTag({
  children,
  tone,
  className
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'admin-dymo px-2 py-1 text-[10px] leading-none',
        tone ? cn(TONE[tone].solid, TONE[tone].on) : undefined,
        className
      )}
    >
      {children}
    </span>
  )
}

import { cn } from '@/lib/utils'
import type { Tone } from './tones'
import { TONE_VAR } from './tones'

/**
 * Paper — the base record surface of the admin: an index card / receipt with a
 * hard ink edge and a printed offset shadow. Replaces the old translucent
 * `Card`. `tone` colours the edge for stateful cards (live cassette = red, next
 * = gold, …). No inner wrapper: the caller's className (flex/grid/padding)
 * governs the children directly.
 */
export function Paper({
  className,
  tone,
  flat = false,
  tape = false,
  children,
  style,
  ...props
}: React.ComponentProps<'div'> & { tone?: Tone; flat?: boolean; tape?: boolean }) {
  return (
    <div
      className={cn('relative text-admin-ink', flat ? 'admin-card-flat' : 'admin-card', className)}
      style={tone ? { borderColor: TONE_VAR[tone], ...style } : style}
      {...props}
    >
      {tape && (
        <span
          aria-hidden
          className='absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 -rotate-2 border border-admin-ink/20 bg-admin-paper-deep/80'
        />
      )}
      {children}
    </div>
  )
}

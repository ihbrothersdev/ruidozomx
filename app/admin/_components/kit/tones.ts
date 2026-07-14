/**
 * Semantic ink tones for the admin "mesa de control". Each maps a state
 * (live cassette, next, accepted, info, connections, muted) to riso-ink
 * classes that read on kraft paper. Keeping the mapping in one place is what
 * lets every section — proposals, cassettes, metrics, donations — stamp the
 * same colour language.
 */
export type Tone = 'red' | 'gold' | 'olive' | 'blue' | 'magenta' | 'ink'

type ToneClasses = {
  text: string
  border: string
  fill: string
  solid: string
  on: string
}

export const TONE: Record<Tone, ToneClasses> = {
  red: {
    text: 'text-admin-red',
    border: 'border-admin-red',
    fill: 'bg-admin-red/12',
    solid: 'bg-admin-red',
    on: 'text-admin-surface'
  },
  gold: {
    text: 'text-admin-gold',
    border: 'border-admin-gold',
    fill: 'bg-admin-gold/15',
    solid: 'bg-admin-gold',
    on: 'text-admin-ink'
  },
  olive: {
    text: 'text-admin-olive',
    border: 'border-admin-olive',
    fill: 'bg-admin-olive/15',
    solid: 'bg-admin-olive',
    on: 'text-admin-surface'
  },
  blue: {
    text: 'text-admin-blue',
    border: 'border-admin-blue',
    fill: 'bg-admin-blue/12',
    solid: 'bg-admin-blue',
    on: 'text-admin-surface'
  },
  magenta: {
    text: 'text-admin-magenta',
    border: 'border-admin-magenta',
    fill: 'bg-admin-magenta/12',
    solid: 'bg-admin-magenta',
    on: 'text-admin-surface'
  },
  ink: {
    text: 'text-admin-ink-soft',
    border: 'border-admin-ink/30',
    fill: 'bg-admin-ink/8',
    solid: 'bg-admin-ink',
    on: 'text-admin-paper'
  }
}

/** Raw CSS values per tone, for inline styles where a Tailwind class would lose
 *  the cascade fight against the unlayered `.admin-card` border shorthand. */
export const TONE_VAR: Record<Tone, string> = {
  red: 'var(--color-admin-red)',
  gold: 'var(--color-admin-gold)',
  olive: 'var(--color-admin-olive)',
  blue: 'var(--color-admin-blue)',
  magenta: 'var(--color-admin-magenta)',
  ink: 'var(--color-admin-line)'
}

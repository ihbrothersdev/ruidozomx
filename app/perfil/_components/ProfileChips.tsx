import type { Role } from '@/lib/types'
import { ROLE_CHIP_CONFIG } from './profile-constants'

interface ProfileChipsProps {
  role: Role
  roleProfile: Record<string, unknown>
}

export default function ProfileChips({ role, roleProfile }: ProfileChipsProps) {
  const chipConfig = ROLE_CHIP_CONFIG[role]
  if (!chipConfig) return null

  const chips: string[] = []

  for (const cfg of chipConfig) {
    const value = roleProfile[cfg.key]

    if (cfg.type === 'boolean' && value === true) {
      chips.push(cfg.label)
    } else if (cfg.type === 'array' && Array.isArray(value)) {
      for (const item of value) {
        chips.push(String(item))
      }
    } else if (cfg.type === 'text' && value) {
      chips.push(`${cfg.label}: ${String(value)}`)
    }
  }

  if (chips.length === 0) return null

  return (
    <div className='flex flex-wrap gap-2'>
      {chips.map((chip, i) => (
        <span
          key={`${chip}-${i}`}
          className='font-pt-mono rounded-sm bg-red-600 px-3 py-1.5 text-[11px] font-bold tracking-wider text-white uppercase'
        >
          {chip}
        </span>
      ))}
    </div>
  )
}

import { ROLE_LABELS, type Role } from '@/lib/types'
import { ROLE_NAME_FIELD } from './profile-constants'
import ProfileChips from './ProfileChips'

interface IdentityBlockProps {
  role: Role | null
  displayName: string
  location: string
  roleProfile: Record<string, any> | null
}

export default function IdentityBlock({ role, displayName, location, roleProfile }: IdentityBlockProps) {
  // Use role-specific name field if available
  const primaryName =
    role && roleProfile && ROLE_NAME_FIELD[role]
      ? (roleProfile[ROLE_NAME_FIELD[role]] as string) || displayName
      : displayName

  return (
    <div className='space-y-1'>
      <h1 className='font-pt-mono text-lg tracking-wider text-black uppercase'>{primaryName}</h1>

      {location && <p className='font-pt-mono text-sm font-bold tracking-wider text-black/60 uppercase'>{location}</p>}

      {role && (
        <p className='font-pt-mono text-xs font-bold tracking-wider text-black/50 uppercase'>
          Rol: {ROLE_LABELS[role] ?? role}
        </p>
      )}

      {role === 'banda' && roleProfile?.genre && (
        <p className='font-pt-mono text-xs font-bold tracking-wider text-black/60 uppercase'>
          Género principal: {roleProfile.genre}
        </p>
      )}

      {role === 'banda' && (
        <p className='font-pt-mono mt-2 text-xs font-bold tracking-wider text-black/50 uppercase'>Disponible para:</p>
      )}

      {/* Chips */}
      {role && roleProfile && (
        <ProfileChips
          role={role}
          roleProfile={roleProfile}
        />
      )}
    </div>
  )
}

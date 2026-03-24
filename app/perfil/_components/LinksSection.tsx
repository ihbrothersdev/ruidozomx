import type { Role } from '@/lib/types'
import { ROLE_LINK_FIELD } from './profile-constants'

interface LinksSectionProps {
  role: Role
  roleProfile: Record<string, unknown>
  socialLinks: Record<string, string> | null
}

export default function LinksSection({ role, roleProfile, socialLinks }: LinksSectionProps) {
  const linkField = ROLE_LINK_FIELD[role]
  const primaryLink = linkField ? (roleProfile[linkField] as string | null) : null
  const contact = roleProfile.contact as string | null

  const hasSocialLinks = socialLinks && Object.keys(socialLinks).length > 0
  const hasAnyContent = primaryLink || contact || hasSocialLinks

  if (!hasAnyContent) return null

  return (
    <div>
      <h3 className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>Links:</h3>
      <div className='mt-2 space-y-1'>
        {primaryLink && (
          <p className='font-pt-mono text-sm'>
            <a
              href={primaryLink.startsWith('http') ? primaryLink : `https://${primaryLink}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-black/70 underline hover:text-black'
            >
              Link del perfil
            </a>
          </p>
        )}

        {hasSocialLinks &&
          Object.entries(socialLinks!).map(([platform, url]) => (
            <p
              key={platform}
              className='font-pt-mono text-sm'
            >
              <a
                href={url.startsWith('http') ? url : `https://${url}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-black/70 underline hover:text-black'
              >
                {platform}
              </a>
            </p>
          ))}

        {contact && (
          <p className='font-pt-mono text-sm text-black/70'>
            Contacto: {contact}
          </p>
        )}
      </div>
    </div>
  )
}

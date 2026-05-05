import { PlatformIcon } from '@/app/components/ui/platform-icon'
import type { Role } from '@/lib/types'

interface LinksSectionProps {
  socialLinks: Record<string, string> | null
  contact: string | null
  /** Currently unused but kept for API stability with callers. */
  role?: Role | null
}

const PLATFORM_LABELS: Record<string, string> = {
  web: 'Web',
  project: 'Proyecto',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp',
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  twitter: 'Twitter / X',
  maps: 'Maps'
}

/** Display order — JSONB doesn't preserve insertion order on retrieval. */
const PLATFORM_ORDER = Object.keys(PLATFORM_LABELS)

function getPlatformLabel(platform: string): string {
  return PLATFORM_LABELS[platform] ?? platform
}

function sortLinks(socialLinks: Record<string, string>): [string, string][] {
  return Object.entries(socialLinks).sort(([a], [b]) => {
    const ai = PLATFORM_ORDER.indexOf(a)
    const bi = PLATFORM_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

export default function LinksSection({ socialLinks, contact }: LinksSectionProps) {
  const sortedLinks = socialLinks ? sortLinks(socialLinks) : []
  const hasSocialLinks = sortedLinks.length > 0
  const hasAnyContent = hasSocialLinks || contact

  if (!hasAnyContent) return null

  return (
    <div className='border border-dashed border-black/20 p-4'>
      <h4 className='font-pt-mono text-lg font-bold tracking-wider text-black uppercase'>Links</h4>
      <div className='mt-2 space-y-1'>
        {sortedLinks.map(([platform, url]) => (
          <a
            key={platform}
            href={url.startsWith('http') ? url : `https://${url}`}
            target='_blank'
            rel='noopener noreferrer'
            className='font-pt-mono flex items-center gap-2 text-sm text-black/70 hover:text-black'
          >
            <PlatformIcon
              platform={platform}
              className='size-4 shrink-0'
            />
            <span className='underline'>{getPlatformLabel(platform)}</span>
          </a>
        ))}

        {contact && <p className='font-pt-mono text-sm text-black/70'>Contacto: {contact}</p>}
      </div>
    </div>
  )
}

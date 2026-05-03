import type { Role } from '@/lib/types'

interface LinksSectionProps {
  socialLinks: Record<string, string> | null
  contact: string | null
  role?: Role | null
}

const PLATFORM_LABELS: Record<string, string> = {
  web: 'Web',
  instagram: 'Instagram',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp',
  maps: 'Maps',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook'
}

function getPlatformLabel(platform: string, role?: Role | null): string {
  // For bandas, the `web` key actually stores the project link
  if (platform === 'web' && role === 'banda') return 'Proyecto'
  return PLATFORM_LABELS[platform] ?? platform
}

export default function LinksSection({ socialLinks, contact, role }: LinksSectionProps) {
  const hasSocialLinks = socialLinks && Object.keys(socialLinks).length > 0
  const hasAnyContent = hasSocialLinks || contact

  if (!hasAnyContent) return null

  return (
    <div className='border border-dashed border-black/20 p-4'>
      <h4 className='font-pt-mono text-lg font-bold tracking-wider text-black uppercase'>Links</h4>
      <div className='mt-2 space-y-1'>
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
                {getPlatformLabel(platform, role)}
              </a>
            </p>
          ))}

        {contact && <p className='font-pt-mono text-sm text-black/70'>Contacto: {contact}</p>}
      </div>
    </div>
  )
}

interface LinksSectionProps {
  socialLinks: Record<string, string> | null
  contact: string | null
}

export default function LinksSection({ socialLinks, contact }: LinksSectionProps) {
  const hasSocialLinks = socialLinks && Object.keys(socialLinks).length > 0
  const hasAnyContent = hasSocialLinks || contact

  if (!hasAnyContent) return null

  return (
    <div>
      <h3 className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>Links:</h3>
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
                {platform}
              </a>
            </p>
          ))}

        {contact && <p className='font-pt-mono text-sm text-black/70'>Contacto: {contact}</p>}
      </div>
    </div>
  )
}

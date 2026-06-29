import { TrackedProfileLink } from '@/app/components/analytics/TrackedProfileLink'

interface CassetteLabelsProps {
  songTitle: string
  artist: string
  date: string
  /** When the artist has a band profile, link the name to it (→ /perfil/[slug]). */
  artistHref?: string
  artistSlug?: string
  songId?: string | null
  cassetteId?: string | null
}

function TruncatedLabel({ text, className }: { text: string; className: string }) {
  const showTooltip = text.split(' ').length > 3

  return (
    <span className={`group/tip ${className} cursor-pointer`}>
      {text}
      {showTooltip && (
        <span
          className='text-md pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded bg-yellow-100 px-2 py-1 whitespace-nowrap text-black normal-case opacity-0 shadow-lg transition-opacity duration-200 group-hover/tip:opacity-100'
          style={{ top: '100%', marginTop: 4 }}
        >
          {text}
        </span>
      )}
    </span>
  )
}

export function CassetteLabels({
  songTitle,
  artist,
  date,
  artistHref,
  artistSlug,
  songId,
  cassetteId
}: CassetteLabelsProps) {
  const artistClass =
    'font-corose block w-full truncate text-center text-xs leading-tight text-black uppercase sm:text-xl md:text-2xl'

  return (
    <>
      <div
        className='absolute z-6'
        style={{ left: '15%', top: '10%', width: '70%', height: '22%' }}
      >
        <div className='absolute inset-0 flex flex-col items-center justify-center px-4'>
          <div className='relative w-full'>
            <TruncatedLabel
              text={songTitle}
              className='font-corose-alt text-md block w-full truncate text-center leading-tight font-bold text-black uppercase sm:text-2xl md:text-3xl'
            />
          </div>
          <div className='relative w-3/4'>
            {artistHref ? (
              <TrackedProfileLink
                href={artistHref}
                targetProfileSlug={artistSlug}
                songId={songId}
                cassetteId={cassetteId}
                source='player'
                title={`Ver perfil de ${artist}`}
                className='block w-full'
              >
                <TruncatedLabel
                  text={artist}
                  className={`${artistClass} hover:underline`}
                />
              </TrackedProfileLink>
            ) : (
              <TruncatedLabel
                text={artist}
                className={artistClass}
              />
            )}
          </div>
        </div>
      </div>

      {/* Date label */}
      <div
        className='absolute z-6'
        style={{ left: '5%', top: '65%', width: '22%', height: '14.5%' }}
      >
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='font-corose-alt text-[10px] leading-tight whitespace-nowrap text-black sm:text-base md:text-xl'>
            {date}
          </span>
        </div>
      </div>
    </>
  )
}

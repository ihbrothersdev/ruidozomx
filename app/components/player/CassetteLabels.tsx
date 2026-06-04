import Link from 'next/link'

interface CassetteLabelsProps {
  songTitle: string
  artist: string
  /** When the current song's artist has a band profile, its slug — makes the
   *  artist label a link to /perfil/[slug]. Undefined = plain text (no profile). */
  artistSlug?: string
  date: string
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

export function CassetteLabels({ songTitle, artist, artistSlug, date }: CassetteLabelsProps) {
  return (
    <>
      <div
        className='absolute z-6'
        style={{ left: '15%', top: '10%', width: '70%', height: '22%' }}
      >
        <div className='absolute inset-0 flex flex-col items-center justify-center px-4'>
          {artistSlug ? (
            // Both the song title and the band name link to the band profile.
            // Persistent cue (mobile has no hover): brand-red band name +
            // underline + an avatar-style profile badge.
            <Link
              href={`/perfil/${artistSlug}`}
              title={`Ver perfil de ${artist}`}
              className='flex w-full flex-col items-center transition-opacity hover:opacity-75'
            >
              <div className='relative w-full'>
                <TruncatedLabel
                  text={songTitle}
                  className='font-corose-alt text-md block w-full truncate text-center leading-tight font-bold text-black uppercase sm:text-2xl md:text-3xl'
                />
              </div>
              <div className='relative flex w-3/4 items-center justify-center gap-1.5 text-red-700'>
                <TruncatedLabel
                  text={artist}
                  className='font-corose min-w-0 truncate text-center text-xs leading-tight uppercase underline decoration-red-700/60 underline-offset-2 sm:text-xl md:text-2xl'
                />
                <span className='inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-700 text-yellow-50 shadow-sm sm:h-5 sm:w-5'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    aria-hidden='true'
                    className='h-2.5 w-2.5 sm:h-3 sm:w-3'
                  >
                    <circle
                      cx='12'
                      cy='8'
                      r='4.5'
                    />
                    <path d='M3.5 21a8.5 8.5 0 0 1 17 0Z' />
                  </svg>
                </span>
              </div>
            </Link>
          ) : (
            <>
              <div className='relative w-full'>
                <TruncatedLabel
                  text={songTitle}
                  className='font-corose-alt text-md block w-full truncate text-center leading-tight font-bold text-black uppercase sm:text-2xl md:text-3xl'
                />
              </div>
              <div className='relative w-3/4'>
                <TruncatedLabel
                  text={artist}
                  className='font-corose block w-full truncate text-center text-xs leading-tight text-black uppercase sm:text-xl md:text-2xl'
                />
              </div>
            </>
          )}
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

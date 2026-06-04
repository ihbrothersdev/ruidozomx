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
          <div className='relative w-full'>
            <TruncatedLabel
              text={songTitle}
              className='font-corose-alt text-md block w-full truncate text-center leading-tight font-bold text-black uppercase sm:text-2xl md:text-3xl'
            />
          </div>
          <div className='relative w-3/4'>
            {artistSlug ? (
              <Link
                href={`/perfil/${artistSlug}`}
                title={`Ver perfil de ${artist}`}
                className='flex items-center justify-center gap-1.5 text-red-700 transition-opacity hover:opacity-75'
              >
                {/* Persistent profile-link cue (mobile has no hover): brand-red
                 *  name + solid underline + person icon. */}
                <TruncatedLabel
                  text={artist}
                  className='font-corose min-w-0 truncate text-center text-xs leading-tight uppercase underline decoration-red-700/60 underline-offset-2 sm:text-xl md:text-2xl'
                />
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden='true'
                  className='h-3 w-3 shrink-0 sm:h-4 sm:w-4'
                >
                  <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                  <circle
                    cx='12'
                    cy='7'
                    r='4'
                  />
                </svg>
              </Link>
            ) : (
              <TruncatedLabel
                text={artist}
                className='font-corose block w-full truncate text-center text-xs leading-tight text-black uppercase sm:text-xl md:text-2xl'
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

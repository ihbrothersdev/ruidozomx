interface CassetteLabelsProps {
  songTitle: string
  artist: string
  date: string
}

function TruncatedLabel({
  text,
  className
}: {
  text: string
  className: string
}) {
  const showTooltip = text.split(' ').length > 3

  return (
    <span className={`group/tip ${className} cursor-pointer`}>
      {text}
      {showTooltip && (
        <span className='pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded bg-yellow-100 px-2 py-1 text-md text-black normal-case opacity-0 shadow-lg transition-opacity duration-200 group-hover/tip:opacity-100' style={{ top: '100%', marginTop: 4 }}>
          {text}
        </span>
      )}
    </span>
  )
}

export function CassetteLabels({ songTitle, artist, date }: CassetteLabelsProps) {
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
              className='block w-full truncate text-center font-corose-alt text-3xl leading-tight text-gray-900 uppercase'
            />
          </div>
          <div className='relative w-3/4'>
            <TruncatedLabel
              text={artist}
              className='block w-full truncate text-center font-corose text-2xl leading-tight text-gray-700 uppercase'
            />
          </div>
        </div>
      </div>

      {/* Date label */}
      <div
        className='absolute z-6'
        style={{ left: '5%', top: '65%', width: '22%', height: '14.5%' }}
      >
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='font-corose text-3xl text-gray-800'>{date}</span>
        </div>
      </div>
    </>
  )
}

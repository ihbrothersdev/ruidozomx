import Image from 'next/image'

interface CassetteLabelsProps {
  songTitle: string
  artist: string
  date: string
}

export function CassetteLabels({ songTitle, artist, date }: CassetteLabelsProps) {
  return (
    <>
      {/* Song title + artist label strip */}
      <div
        className='absolute z-6'
        style={{ left: '15%', top: '10%', width: '70%', height: '22%' }}
      >
        <div className='absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4'>
          <span className='font-corose-alt w-full truncate text-center text-3xl leading-tight text-gray-900 uppercase'>
            {songTitle}
          </span>
          <span className='font-corose w-full truncate text-center text-2xl leading-tight text-gray-700 uppercase'>
            {artist}
          </span>
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

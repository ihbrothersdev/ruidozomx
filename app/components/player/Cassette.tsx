import Image from 'next/image'

interface CassetteProps {
  songTitle: string
  artist: string
  date: string
  side: 'A' | 'B'
}

export function Cassette({ songTitle, artist, date, side }: CassetteProps) {
  return (
    <div
      className='relative mx-auto w-full'
      style={{ maxWidth: 793, aspectRatio: '793 / 497' }}
    >
      {/* Shadow behind cassette */}
      <div
        className='absolute z-0'
        style={{ top: '2%', left: '2%', width: '104%', height: '106%' }}
      >
        <Image
          src='/assets/cassette/sombra-cassette.png'
          alt=''
          fill
          className='object-contain'
          unoptimized
        />
      </div>

      {/* Tape body */}
      <div className='absolute inset-0 z-[1]'>
        <Image
          src='/assets/cassette/tape.png'
          alt='Cassette tape'
          fill
          className='object-contain'
          priority
          unoptimized
        />
      </div>
    </div>
  )
}

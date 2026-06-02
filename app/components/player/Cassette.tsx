import Image from 'next/image'
import { CassetteReels } from './CassetteReels'
import { CassetteLabels } from './CassetteLabels'

interface CassetteProps {
  songTitle: string
  artist: string
  artistSlug?: string
  date: string
  side: 'A' | 'B'
  isPlaying?: boolean
}

export function Cassette({ songTitle, artist, artistSlug, date, side, isPlaying }: CassetteProps) {
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
        />
      </div>

      {/* Consolidated cassette body (A/B, arrow, 90 baked in) */}
      <div className='absolute inset-0 z-[1]'>
        <Image
          src={side === 'A' ? '/assets/cassette/cassette-side-a.png' : '/assets/cassette/cassette-side-b.png'}
          alt={`Cassette lado ${side}`}
          fill
          priority
        />
      </div>

      {/* Reels (separate for future animation) */}
      <CassetteReels isPlaying={isPlaying} />

      {/* Dynamic text labels (song title, artist, date) */}
      <CassetteLabels
        songTitle={songTitle}
        artist={artist}
        artistSlug={artistSlug}
        date={date}
      />
    </div>
  )
}

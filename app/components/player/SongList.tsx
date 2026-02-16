import Image from 'next/image'
import type { Song } from '@/lib/types'

interface SongListProps {
  songs: Song[]
  currentSongId: number
}

const FIRST_LINE_TOP = 11.5
const LINE_SPACING = 7.8

export function SongList({ songs, currentSongId }: SongListProps) {
  const sideA = songs.filter(s => s.side === 'A')
  const sideB = songs.filter(s => s.side === 'B')

  return (
    <div
      className='relative mx-auto w-full'
      style={{ maxWidth: 793, aspectRatio: '1344 / 975' }}
    >
      {/* Shadow */}
      <div
        className='absolute z-0'
        style={{ top: '4%', left: '3%', width: '100%', height: '100%' }}
      >
        <Image
          src='/assets/lista-canciones/sombra-lista.png'
          alt=''
          fill
          className='object-contain'
          unoptimized
        />
      </div>

      {/* Notebook background */}
      <div className='absolute inset-0 z-[1]'>
        <Image
          src='/assets/lista-canciones/lista-canciones.png'
          alt='Lista de canciones'
          fill
          className='object-contain'
          unoptimized
        />
      </div>

      {/* Side A songs */}
      <div
        className='absolute z-[2]'
        style={{ left: '6%', top: '8%', width: '42%' }}
      >
        {sideA.map((song, i) => (
          <div
            key={song.id}
            className='font-corose flex items-center text-xs text-gray-800'
            style={{ marginTop: i === 0 ? `${FIRST_LINE_TOP}%` : 0, height: `${LINE_SPACING}%`, lineHeight: 1 }}
          >
            {song.id === currentSongId && <span className='mr-1 text-orange-600'>&#9654;</span>}
            <span className='truncate'>
              {song.title} - {song.artist}
            </span>
          </div>
        ))}
      </div>

      {/* Side B songs */}
      <div
        className='absolute z-[2]'
        style={{ left: '54%', top: '8%', width: '42%' }}
      >
        {sideB.map((song, i) => (
          <div
            key={song.id}
            className='font-corose flex items-center text-xs text-gray-800'
            style={{ marginTop: i === 0 ? `${FIRST_LINE_TOP}%` : 0, height: `${LINE_SPACING}%`, lineHeight: 1 }}
          >
            {song.id === currentSongId && <span className='mr-1 text-orange-600'>&#9654;</span>}
            <span className='truncate'>
              {song.title} - {song.artist}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

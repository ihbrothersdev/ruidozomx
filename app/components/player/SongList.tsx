'use client'

import type { PlayerSong } from '@/lib/types'
import Image from 'next/image'
import { SongRow } from './SongRow'

interface SongListProps {
  songs: PlayerSong[]
  currentSongId: string
  onSelectSong?: (id: string) => void
}

export function SongList({ songs, currentSongId, onSelectSong }: SongListProps) {
  const sides = {
    A: songs.filter(s => s.side === 'A'),
    B: songs.filter(s => s.side === 'B')
  }
  const rows = Math.max(sides.A.length, sides.B.length, 1)

  return (
    <div
      className='relative mx-auto w-full'
      style={{ maxWidth: 793, aspectRatio: '1344 / 975' }}
    >
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

      <div className='absolute inset-0 z-1'>
        <Image
          src='/assets/lista-canciones/lista-canciones.png'
          alt='Lista de canciones'
          fill
          className='object-contain'
          unoptimized
        />
      </div>

      <div
        className='absolute top-[16%] right-[1.5%] bottom-[17.5%] left-[1.5%] z-[2] grid grid-cols-2 gap-x-[3%]'
        style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {Array.from({ length: rows }, (_, i) => (
          <SongRow
            key={i}
            index={i}
            sides={sides}
            currentSongId={currentSongId}
            onSelectSong={onSelectSong}
          />
        ))}
      </div>
    </div>
  )
}

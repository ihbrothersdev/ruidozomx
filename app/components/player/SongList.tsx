'use client'

import type { Song } from '@/lib/types'
import Image from 'next/image'
import { Fragment } from 'react/jsx-runtime'

interface SongListProps {
  songs: Song[]
  currentSongId: number
  onSelectSong?: (id: number) => void
}

const ROWS = 13

export function SongList({ songs, currentSongId, onSelectSong }: SongListProps) {
  const sideA = songs.filter(s => s.side === 'A')
  const sideB = songs.filter(s => s.side === 'B')

  const renderCell = (song: Song | undefined) => {
    if (!song) return null
    const isActive = song.id === currentSongId

    return (
      <button
        type='button'
        className={`font-corose flex w-full min-w-0 cursor-pointer items-end text-left leading-none ${
          isActive ? 'text-orange-600' : 'text-gray-800 hover:text-orange-500'
        }`}
        style={{ fontSize: 'clamp(9px, 1.4vw, 14px)', paddingBottom: '4px' }}
        onClick={() => onSelectSong?.(song.id)}
      >
        {isActive && <span className='mr-0.5 shrink-0'>&#9654;</span>}
        <span className='min-w-0 truncate'>
          {song.title} - {song.artist}
        </span>
      </button>
    )
  }

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
      <div className='absolute inset-0 z-1'>
        <Image
          src='/assets/lista-canciones/lista-canciones.png'
          alt='Lista de canciones'
          fill
          className='object-contain'
          unoptimized
        />
      </div>

      {/* Song grid */}
      <div
        className='absolute z-2'
        style={{
          top: '16%',
          bottom: '17.5%',
          left: '1.5%',
          right: '1.5%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          columnGap: '3%'
        }}
      >
        {Array.from({ length: ROWS }, (_, i) => (
          <Fragment key={i}>
            <div className='flex min-w-0 items-end overflow-hidden'>{renderCell(sideA[i])}</div>
            <div className='flex min-w-0 items-end overflow-hidden'>{renderCell(sideB[i])}</div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

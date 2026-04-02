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
    <>
      {/* Desktop: 2-column layout */}
      <div
        className='relative mx-auto hidden w-full md:block'
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

      {/* Mobile: single image with Side A top half, Side B bottom half */}
      <div
        className='relative mx-auto w-full md:hidden'
        style={{ maxWidth: 400, aspectRatio: '455 / 902' }}
      >
        <div className='absolute inset-0 z-1'>
          <Image
            src='/assets/lista-canciones/lista-canciones-mobile.png'
            alt='Lista de canciones'
            fill
            className='object-contain'
            unoptimized
          />
        </div>

        {/* Side A — top half */}
        <div
          className='absolute top-[9%] right-[4%] bottom-[53%] left-[4%] z-[2] grid grid-cols-1'
          style={{ gridTemplateRows: `repeat(15, 1fr)` }}
        >
          {sides.A.map((song, i) => {
            const isActive = song.id === currentSongId
            return (
              <div key={song.id} className='flex min-w-0 items-end overflow-hidden'>
                <button
                  type='button'
                  className={`font-corose flex w-full min-w-0 cursor-pointer items-end pb-[2px] text-left leading-none ${
                    isActive ? 'text-orange-600' : 'text-gray-800 hover:text-orange-500'
                  }`}
                  style={{ fontSize: 'clamp(10px, 2.8vw, 14px)' }}
                  onClick={() => onSelectSong?.(song.id)}
                >
                  {isActive && <span className='mr-0.5 shrink-0'>&#9654;</span>}
                  <span className='font-corose-alt shrink-0 font-bold'>
                    {i + 1}. {song.title}
                  </span>
                  <span className='font-corose min-w-0 truncate'> - {song.artist}</span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Side B — bottom half */}
        <div
          className='absolute top-[58%] right-[4%] bottom-[4%] left-[4%] z-[2] grid grid-cols-1'
          style={{ gridTemplateRows: `repeat(15, 1fr)` }}
        >
          {sides.B.map((song, i) => {
            const isActive = song.id === currentSongId
            return (
              <div key={song.id} className='flex min-w-0 items-end overflow-hidden'>
                <button
                  type='button'
                  className={`font-corose flex w-full min-w-0 cursor-pointer items-end pb-[2px] text-left leading-none ${
                    isActive ? 'text-orange-600' : 'text-gray-800 hover:text-orange-500'
                  }`}
                  style={{ fontSize: 'clamp(10px, 2.8vw, 14px)' }}
                  onClick={() => onSelectSong?.(song.id)}
                >
                  {isActive && <span className='mr-0.5 shrink-0'>&#9654;</span>}
                  <span className='font-corose-alt shrink-0 font-bold'>
                    {i + 1}. {song.title}
                  </span>
                  <span className='font-corose min-w-0 truncate'> - {song.artist}</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

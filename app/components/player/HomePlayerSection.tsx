'use client'

import type { PlayerSong } from '@/lib/types'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { CassettePlayer } from './CassettePlayer'
import { MientrasSuena } from './MientrasSuena'
import { SongList } from './SongList'

interface HomePlayerSectionProps {
  songs: PlayerSong[]
  initialSongId: string
  date: string
  isAuthenticated: boolean
  autoPlay?: boolean
  cassetteActive?: boolean
  /**
   * URL of the concatenated cassette MP3 (produced by `npm run build-cassette`).
   * When present (and `songs` carry per-song offsets), the player streams a
   * single continuous file and navigates via `currentTime`. When null, the
   * player falls back to the legacy per-song-URL mode. See useAudioPlayer.
   */
  concatAudioUrl?: string | null
}

export function HomePlayerSection({
  songs,
  initialSongId,
  date,
  isAuthenticated,
  autoPlay,
  cassetteActive = true,
  concatAudioUrl
}: HomePlayerSectionProps) {
  const {
    isPlaying,
    isStopped,
    currentSongId,
    currentSide,
    elapsedSeconds,
    progress,
    play,
    pause,
    stop,
    next,
    prev,
    seek,
    playSong
  } = useAudioPlayer(songs, initialSongId, concatAudioUrl)

  const lastPlayedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!autoPlay || !initialSongId) return
    if (lastPlayedRef.current === initialSongId) return
    lastPlayedRef.current = initialSongId
    playSong(initialSongId)
  }, [autoPlay, initialSongId, playSong])

  const currentSong = songs.find(s => s.id === currentSongId)

  return (
    <>
      {/* Body 1: Cassette player area */}
      <section className='relative flex flex-col items-center px-4 pt-4 pb-4'>
        <div className='relative mx-auto w-full max-w-5xl'>
          <div className='relative flex justify-center'>
            <CassettePlayer
              songTitle={currentSong?.title ?? ''}
              artist={currentSong?.artist ?? ''}
              date={date}
              side={currentSide}
              isPlaying={isPlaying}
              isStopped={isStopped}
              elapsedSeconds={elapsedSeconds}
              progress={progress}
              isAuthenticated={isAuthenticated}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onNext={next}
              onPrev={prev}
              onSeek={seek}
            />
            {!cassetteActive && <ArchivedSticker />}
          </div>
          {!cassetteActive && (
            <div className='mt-6 flex justify-center'>
              <Link
                href='/'
                onClick={() => stop()}
                className='group relative inline-block -rotate-3 transition-all duration-300 hover:scale-105 hover:rotate-0 active:scale-95'
              >
                {/* Scotch-tape "pieces" pinning the label to the page */}
                <span
                  className='pointer-events-none absolute -top-1.5 -left-2 z-10 h-4 w-7 -rotate-45 bg-yellow-200/70 shadow-sm'
                  aria-hidden='true'
                />
                <span
                  className='pointer-events-none absolute -right-2 -bottom-1.5 z-10 h-4 w-7 -rotate-45 bg-yellow-200/70 shadow-sm'
                  aria-hidden='true'
                />
                <span className='relative block border-2 border-red-700 bg-yellow-100 px-5 py-2 shadow-[5px_5px_0_rgba(0,0,0,0.5)] transition-shadow group-hover:shadow-[7px_7px_0_rgba(0,0,0,0.6)] sm:px-6 sm:py-2.5'>
                  <span className='font-baby-doll flex items-center gap-2 text-lg tracking-wider text-red-700 uppercase sm:text-xl md:text-2xl'>
                    <span
                      className='inline-block transition-transform group-hover:-translate-x-1.5'
                      aria-hidden='true'
                    >
                      ↺
                    </span>
                    Retomar el de hoy
                  </span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className='pb-6'>
        <MientrasSuena />
      </div>

      {/* Body 2: Song list */}
      <section className='relative px-4 pt-8 pb-16'>
        <div className='relative mx-auto max-w-5xl'>
          <div className='flex flex-col items-center gap-2 md:flex-row md:items-start md:justify-center'>
            <div className='w-full max-w-[793px] flex-1'>
              <SongList
                songs={songs}
                currentSongId={currentSongId}
                isPlaying={isPlaying}
                onSelectSong={playSong}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ArchivedSticker() {
  return (
    <div
      className='pointer-events-none absolute top-2 right-2 z-20 -rotate-6 sm:top-4 sm:right-4 md:top-6 md:right-6'
      aria-hidden='true'
    >
      <div className='font-baby-doll rounded-sm border-2 border-red-700 bg-yellow-100 px-2 py-1 text-[10px] tracking-wider text-red-700 uppercase shadow-[3px_3px_0_rgba(0,0,0,0.4)] sm:px-3 sm:text-xs md:text-sm'>
        Del archivo
      </div>
    </div>
  )
}

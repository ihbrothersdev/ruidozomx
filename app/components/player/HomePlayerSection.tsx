'use client'

import type { UpcomingEvent } from '@/lib/supabase/events'
import type { PlayerSong } from '@/lib/types'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { CassettePlayer } from './CassettePlayer'
import { MientrasSuena } from './MientrasSuena'
import { SongList } from './SongList'
import { UpcomingEventsCarousel } from './UpcomingEventsCarousel'

interface HomePlayerSectionProps {
  songs: PlayerSong[]
  initialSongId: string
  date: string
  isAuthenticated: boolean
  autoPlay?: boolean
  cassetteActive?: boolean
  cassetteId: string | null
  concatAudioUrl?: string | null
  upcomingEvents?: UpcomingEvent[]
  totalListeners?: number
}

export function HomePlayerSection({
  songs,
  initialSongId,
  date,
  isAuthenticated,
  autoPlay,
  cassetteActive = true,
  cassetteId,
  concatAudioUrl,
  upcomingEvents = [],
  totalListeners = 0
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
  } = useAudioPlayer(songs, initialSongId, cassetteId, concatAudioUrl)

  const lastPlayedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!autoPlay || !initialSongId) return
    if (lastPlayedRef.current === initialSongId) return
    lastPlayedRef.current = initialSongId
    playSong(initialSongId)
  }, [autoPlay, initialSongId, playSong])

  useEffect(() => {
    if (cassetteActive || !currentSongId) return
    const params = new URLSearchParams(window.location.search)
    params.set('song', currentSongId)
    params.delete('cassette')
    window.history.replaceState(null, '', `?${params.toString()}`)
  }, [cassetteActive, currentSongId])

  const currentSong = songs.find(s => s.id === currentSongId)

  return (
    <>
      <section className='relative flex flex-col items-center px-4 pt-4 pb-4'>
        <div className='relative mx-auto w-full max-w-5xl'>
          <div className='relative flex justify-center'>
            <CassettePlayer
              songTitle={currentSong?.title ?? ''}
              artist={currentSong?.artist ?? ''}
              artistSlug={currentSong?.artistSlug}
              songId={currentSong?.id}
              cassetteId={cassetteId}
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
                onClick={e => {
                  // Hard reload: the player's <audio> element survives a soft
                  // navigation, so going back to the active cassette via the
                  // client router leaves the old track playing with stale
                  // props. A full load guarantees a clean player.
                  e.preventDefault()
                  stop()
                  window.location.assign('/')
                }}
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

      <MientrasSuena totalListeners={totalListeners} />

      {/* Body 2: Song list */}
      <section className='relative px-4 pt-8 pb-12'>
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

      {upcomingEvents.length > 0 && (
        <section className='relative z-20 pb-16'>
          <UpcomingEventsCarousel events={upcomingEvents} />
        </section>
      )}
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

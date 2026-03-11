'use client'

import type { PlayerSong } from '@/lib/types'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { CassettePlayer } from './CassettePlayer'
import { MientrasSuena } from './MientrasSuena'
import { SongList } from './SongList'

interface HomePlayerSectionProps {
  songs: PlayerSong[]
  initialSongId: string
  date: string
  isAuthenticated: boolean
}

export function HomePlayerSection({ songs, initialSongId, date, isAuthenticated }: HomePlayerSectionProps) {
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
  } = useAudioPlayer(songs, initialSongId)

  const currentSong = songs.find(s => s.id === currentSongId)

  return (
    <>
      {/* Body 1: Cassette player area */}
      <section className='relative flex flex-col items-center px-4 pt-4 pb-8'>
        <div className='relative mx-auto w-full max-w-5xl'>
          <div className='flex justify-center'>
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
          </div>
        </div>
      </section>

    <div className="pb-30">
      <MientrasSuena />
    </div>

      {/* Body 2: Song list */}
      <section className='relative px-4 py-8'>
        <div className='relative mx-auto max-w-5xl'>
          <div className='flex flex-col items-center gap-2 md:flex-row md:items-start md:justify-center'>
            <div className='w-full max-w-[793px] flex-1'>
              <SongList
                songs={songs}
                currentSongId={currentSongId}
                onSelectSong={playSong}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

'use client'

import type { Song } from '@/lib/types'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { CassettePlayer } from './CassettePlayer'
import { SongList } from './SongList'
import { ExplorarComunidad } from './ExplorarComunidad'

interface HomePlayerSectionProps {
  songs: Song[]
  initialSongId: number
  date: string
}

export function HomePlayerSection({ songs, initialSongId, date }: HomePlayerSectionProps) {
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

      {/* Body 2: Song list + community */}
      <section className='relative px-4 py-8'>
        <div className='relative mx-auto max-w-5xl'>
          <div className='flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center'>
            <div className='hidden md:block'>
              <ExplorarComunidad />
            </div>
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

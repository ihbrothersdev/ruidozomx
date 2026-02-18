'use client'

import { Cassette } from './Cassette'
import { TransportControls } from './TransportControls'
import { PlayingArrow } from './PlayingArrow'
import { DialogBubble } from './DialogBubble'

interface CassettePlayerProps {
  songTitle: string
  artist: string
  date: string
  side: 'A' | 'B'
  isPlaying: boolean
  elapsedSeconds: number
  progress: number
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (progress: number) => void
}

export function CassettePlayer({
  songTitle,
  artist,
  date,
  side,
  isPlaying,
  elapsedSeconds,
  progress,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrev,
  onSeek
}: CassettePlayerProps) {
  return (
    <div
      className='relative mx-auto w-full'
      style={{ maxWidth: 793 }}
    >
      {/* Cassette + Playing arrow + Dialog bubble */}
      <div className='relative'>
        <Cassette
          songTitle={songTitle}
          artist={artist}
          date={date}
          side={side}
          isPlaying={isPlaying}
        />
        <PlayingArrow />
        <DialogBubble />
      </div>

      {/* Transport controls */}
      <div className='mt-[-2px]'>
        <TransportControls
          elapsedSeconds={elapsedSeconds}
          isPlaying={isPlaying}
          progress={progress}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
          onNext={onNext}
          onPrev={onPrev}
          onSeek={onSeek}
        />
      </div>

      {/* <MientrasSuena listenerCount={3} /> */}
    </div>
  )
}

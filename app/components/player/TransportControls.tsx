'use client'

import Image from 'next/image'
import { PrevButton, StopButton, PlayButton, PauseButton, NextButton } from './TransportButton'
import { TimeCounter } from './TimeCounter'
import { ProgressBar } from './ProgressBar'

interface TransportControlsProps {
  elapsedSeconds: number
  isPlaying: boolean
  isStopped: boolean
  progress: number
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (progress: number) => void
}

export function TransportControls({
  elapsedSeconds,
  isPlaying,
  isStopped,
  progress,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrev,
  onSeek
}: TransportControlsProps) {
  return (
    <div
      className='relative mx-auto w-full'
      style={{ maxWidth: 794 }}
    >
      {/* Shadow */}
      <Image
        src='/assets/controles/sombra-controles.png'
        alt=''
        width={706}
        height={171}
        className='absolute top-2 left-1/2 -z-10 -translate-x-1/2'
        style={{ width: '78%', height: 'auto' }}
        unoptimized
      />

      <div className='mx-auto flex w-full justify-center' style={{ maxWidth: 700 }}>
        <div className='relative'>
          <Image
            src='/assets/controles/carcasa.png'
            alt=''
            width={570}
            height={123}
            unoptimized
          />

          {/* Content overlaid on carcasa */}
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <div className='px-[4%] py-[2.4%]'>
              <ProgressBar progress={progress} onSeek={onSeek} />
            </div>

            {/* Buttons + time counter row */}
            <div className='flex items-center px-[3%]'>
              <PrevButton onClick={onPrev} />
              <StopButton onClick={onStop} active={isStopped} />
              <PlayButton onClick={onPlay} active={isPlaying} />
              <PauseButton onClick={onPause} active={!isPlaying && elapsedSeconds > 0} />
              <NextButton onClick={onNext} />

              {/* Time counter */}
              <div className='ml-2'>
                <TimeCounter seconds={elapsedSeconds} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

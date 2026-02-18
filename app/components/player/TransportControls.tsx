'use client'

import Image from 'next/image'
import { TransportButton } from './TransportButton'
import { TimeCounter } from './TimeCounter'
import { ProgressBar } from './ProgressBar'

interface TransportControlsProps {
  elapsedSeconds: number
  isPlaying: boolean
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

      {/* Carcasa housing — centered */}
      <div className='relative mx-auto'>
        <Image
          src='/assets/controles/carcasa.png'
          alt=''
          width={794}
          height={172}
          className='w-full'
          unoptimized
        />

        {/* Content overlaid on carcasa */}
        <div className='absolute inset-0 flex flex-col justify-center px-[5%]'>
          {/* Progress bar row */}
          <div className='mb-1'>
            <ProgressBar progress={progress} onSeek={onSeek} />
          </div>

          {/* Buttons + time counter row */}
          <div className='flex items-center gap-[1%]'>
            <div className='flex flex-1 items-center gap-[1%]'>
              <TransportButton
                offSrc='/assets/controles/regresar-off.png'
                onSrc='/assets/controles/regresar-on.png'
                alt='Regresar'
                onClick={onPrev}
              />
              <TransportButton
                offSrc='/assets/controles/stop-off.png'
                onSrc='/assets/controles/stop-on.png'
                alt='Stop'
                onClick={onStop}
                active={!isPlaying && elapsedSeconds === 0}
              />
              <TransportButton
                offSrc='/assets/controles/play-off.png'
                onSrc='/assets/controles/play-on.png'
                alt='Play'
                onClick={onPlay}
                active={isPlaying}
              />
              <TransportButton
                offSrc='/assets/controles/pausa-off.png'
                onSrc='/assets/controles/pausa-on.png'
                alt='Pausa'
                onClick={onPause}
                active={!isPlaying && elapsedSeconds > 0}
              />
              <TransportButton
                offSrc='/assets/controles/adelantar-off.png'
                onSrc='/assets/controles/adelantar-on.png'
                alt='Adelantar'
                onClick={onNext}
              />
            </div>

            {/* Time counter */}
            <div className='shrink-0'>
              <TimeCounter seconds={elapsedSeconds} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

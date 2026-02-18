'use client'

import { useCallback, useRef } from 'react'
import Image from 'next/image'

interface ProgressBarProps {
  progress: number
  onSeek: (progress: number) => void
}

export function ProgressBar({ progress, onSeek }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null)

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = barRef.current
      if (!bar) return
      const rect = bar.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      onSeek(pct)
    },
    [onSeek]
  )

  const handleDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const bar = barRef.current
      if (!bar) return
      e.preventDefault()

      const move = (ev: PointerEvent) => {
        const rect = bar.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
        onSeek(pct)
      }

      const up = () => {
        document.removeEventListener('pointermove', move)
        document.removeEventListener('pointerup', up)
      }

      document.addEventListener('pointermove', move)
      document.addEventListener('pointerup', up)
    },
    [onSeek]
  )

  return (
    <div
      ref={barRef}
      className='relative flex h-3 w-full cursor-pointer items-center'
      onClick={handleSeek}
    >
      {/* Orange elapsed bar */}
      <div
        className='h-3 overflow-hidden'
        style={{ width: `${progress * 100}%` }}
      >
        <Image
          src='/assets/controles/barra-naranja.png'
          alt=''
          width={321}
          height={12}
          className='h-full w-full object-cover object-left'
          unoptimized
          draggable={false}
        />
      </div>

      {/* Scrubber ball */}
      <div
        className='absolute z-10 -translate-x-1/2 cursor-grab active:cursor-grabbing'
        style={{ left: `${progress * 100}%` }}
        onPointerDown={handleDrag}
      >
        <Image
          src='/assets/controles/bolita.png'
          alt='Scrubber'
          width={34}
          height={36}
          className='h-5 w-auto'
          unoptimized
          draggable={false}
        />
      </div>

      {/* Black remaining bar */}
      <div
        className='h-3 flex-1 overflow-hidden'
      >
        <Image
          src='/assets/controles/barra-negra.png'
          alt=''
          width={591}
          height={12}
          className='h-full w-full object-cover object-right'
          unoptimized
          draggable={false}
        />
      </div>
    </div>
  )
}

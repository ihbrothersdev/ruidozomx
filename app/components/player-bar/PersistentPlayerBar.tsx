'use client'

import { useCallback } from 'react'
import Image from 'next/image'
import {
  usePlayerState,
  usePlayerActions,
  usePlayerSongs,
  useCurrentSong,
  usePlayerVolume
} from '@/app/hooks/usePlayerStore'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PersistentPlayerBar() {
  const songs = usePlayerSongs()
  const currentSong = useCurrentSong()
  const { isPlaying, progress, elapsedSeconds, duration } = usePlayerState()
  const { play, pause, next, prev, seek, setVolume, toggleMute } = usePlayerActions()
  const { volume, isMuted } = usePlayerVolume()

  // Click/drag handlers read the actual element from the event — NOT a shared
  // ref. The bar renders twice (mobile + desktop); a single ref would point at
  // the hidden desktop copy, whose getBoundingClientRect() is 0 on mobile and
  // broke the sliders there.
  const pctFromBar = (bar: HTMLElement, clientX: number) => {
    const rect = bar.getBoundingClientRect()
    if (!rect.width) return null
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  const makeScrub = useCallback(
    (apply: (pct: number) => void) => ({
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {
        const pct = pctFromBar(e.currentTarget, e.clientX)
        if (pct !== null) apply(pct)
      },
      // The dot lives inside the bar; its parent is the track we measure against.
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        const bar = e.currentTarget.parentElement
        if (!bar) return
        e.preventDefault()
        const move = (ev: PointerEvent) => {
          const pct = pctFromBar(bar, ev.clientX)
          if (pct !== null) apply(pct)
        }
        const up = () => {
          document.removeEventListener('pointermove', move)
          document.removeEventListener('pointerup', up)
        }
        document.addEventListener('pointermove', move)
        document.addEventListener('pointerup', up)
      }
    }),
    []
  )

  const progressScrub = makeScrub(seek)
  const volumeScrub = makeScrub(setVolume)

  // Don't render until songs are loaded
  if (songs.length === 0) return null

  return (
    <div
      className='fixed right-0 bottom-0 left-0 z-50 border-t border-[#e8e0c8]/20 px-3 md:px-5'
      style={{
        backgroundImage: "url('/assets/player-bar/background.png')",
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.6)'
      }}
    >
      {/* ── MOBILE: Apple Music-style stacked layout ────────────── */}
      <div className='flex flex-col gap-1.5 px-1 py-2 md:hidden'>
        {/* Row 1: Song title + artist */}
        {currentSong && (
          <div className='text-center'>
            <span className='block truncate font-[family-name:var(--font-corose)] text-base leading-tight font-semibold text-[#e8e0c8]'>
              {currentSong.title}
            </span>
            <span className='block truncate font-[family-name:var(--font-corose)] text-xs leading-tight text-[#e8e0c8]/50'>
              {currentSong.artist}
            </span>
          </div>
        )}

        {/* Row 2: Progress bar + timestamps */}
        <div className='flex items-center gap-2'>
          <span className='w-8 text-right font-[family-name:var(--font-akzidenz)] text-[10px] text-[#e8e0c8]/50 tabular-nums'>
            {formatTime(elapsedSeconds)}
          </span>
          <div
            className='relative flex h-3 flex-1 cursor-pointer items-center'
            onClick={progressScrub.onClick}
          >
            <div
              className='h-[3px] rounded-full bg-[#e8e0c8]/80'
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className='absolute z-10 -translate-x-1/2 cursor-grab active:cursor-grabbing'
              style={{ left: `${progress * 100}%` }}
              onPointerDown={progressScrub.onPointerDown}
            >
              <Image
                src='/assets/player-bar/dot.png'
                alt='Scrubber'
                width={14}
                height={14}
                className='h-3 w-3'
                unoptimized
                draggable={false}
              />
            </div>
            <div className='h-[3px] flex-1 rounded-full bg-[#e8e0c8]/20' />
          </div>
          <span className='w-8 font-[family-name:var(--font-akzidenz)] text-[10px] text-[#e8e0c8]/50 tabular-nums'>
            {formatTime(duration)}
          </span>
        </div>

        {/* Row 3: Transport controls — big and centered */}
        <div className='flex items-center justify-center gap-6'>
          <button
            onClick={prev}
            className='flex h-10 w-10 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
            aria-label='Anterior'
          >
            <Image
              src='/assets/player-bar/previous.png'
              alt='Anterior'
              width={28}
              height={28}
              className='h-6 w-auto'
              unoptimized
              draggable={false}
            />
          </button>
          <button
            onClick={isPlaying ? pause : play}
            className='flex h-12 w-12 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            <Image
              src={isPlaying ? '/assets/player-bar/pause.png' : '/assets/player-bar/play.png'}
              alt={isPlaying ? 'Pausar' : 'Reproducir'}
              width={36}
              height={36}
              className='h-8 w-auto'
              unoptimized
              draggable={false}
            />
          </button>
          <button
            onClick={next}
            className='flex h-10 w-10 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
            aria-label='Siguiente'
          >
            <Image
              src='/assets/player-bar/forward.png'
              alt='Siguiente'
              width={28}
              height={28}
              className='h-6 w-auto'
              unoptimized
              draggable={false}
            />
          </button>
        </div>

        {/* Row 4: Volume slider with icons on each side */}
        <div className='flex items-center gap-2 px-2'>
          <button
            onClick={toggleMute}
            className='flex shrink-0 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            <Image
              src='/assets/player-bar/mute.png'
              alt=''
              width={14}
              height={14}
              className='h-3 w-auto opacity-50'
              unoptimized
              draggable={false}
            />
          </button>
          <div
            className='relative flex h-3 flex-1 cursor-pointer items-center'
            onClick={volumeScrub.onClick}
          >
            <div className='absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#e8e0c8]/20' />
            <div
              className='absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full bg-[#e8e0c8]/80'
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
            <div
              className='absolute z-10 cursor-grab active:cursor-grabbing'
              style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - ${(isMuted ? 0 : volume) * 10}px)` }}
              onPointerDown={volumeScrub.onPointerDown}
            >
              <Image
                src='/assets/player-bar/dot.png'
                alt='Volumen'
                width={10}
                height={10}
                className='h-2.5 w-2.5'
                unoptimized
                draggable={false}
              />
            </div>
          </div>
          <Image
            src='/assets/player-bar/sound.png'
            alt=''
            width={14}
            height={14}
            className='h-3 w-auto shrink-0 opacity-50'
            unoptimized
            draggable={false}
          />
        </div>
      </div>

      {/* ── DESKTOP: 3-column layout (Spotify-style) ─────────────── */}
      <div className='hidden h-16 items-center md:flex'>
        {/* Left: Song info */}
        <div className='flex min-w-0 shrink-0 items-center gap-3 md:w-[30%]'>
          {currentSong && (
            <div className='flex min-w-0 flex-col'>
              <span className='truncate font-[family-name:var(--font-corose)] text-lg leading-tight text-[#e8e0c8]'>
                {currentSong.title}
              </span>
              <span className='truncate font-[family-name:var(--font-corose)] text-base leading-tight text-[#e8e0c8]/50'>
                {currentSong.artist}
              </span>
            </div>
          )}
        </div>

        {/* Center: Controls + progress */}
        <div className='mx-4 flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5'>
          <div className='flex items-center gap-2'>
            <button
              onClick={prev}
              className='flex h-8 w-8 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
              aria-label='Anterior'
            >
              <Image
                src='/assets/player-bar/previous.png'
                alt='Anterior'
                width={20}
                height={20}
                className='h-4 w-auto'
                unoptimized
                draggable={false}
              />
            </button>
            <button
              onClick={isPlaying ? pause : play}
              className='flex h-9 w-9 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              <Image
                src={isPlaying ? '/assets/player-bar/pause.png' : '/assets/player-bar/play.png'}
                alt={isPlaying ? 'Pausar' : 'Reproducir'}
                width={24}
                height={24}
                className='h-5 w-auto'
                unoptimized
                draggable={false}
              />
            </button>
            <button
              onClick={next}
              className='flex h-8 w-8 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
              aria-label='Siguiente'
            >
              <Image
                src='/assets/player-bar/forward.png'
                alt='Siguiente'
                width={20}
                height={20}
                className='h-4 w-auto'
                unoptimized
                draggable={false}
              />
            </button>
          </div>

          <div className='flex w-full max-w-xl items-center gap-2'>
            <span className='w-9 text-right font-[family-name:var(--font-akzidenz)] text-[10px] text-[#e8e0c8]/50 tabular-nums'>
              {formatTime(elapsedSeconds)}
            </span>
            <div
              className='relative flex h-3 flex-1 cursor-pointer items-center'
              onClick={progressScrub.onClick}
            >
              <div
                className='h-[3px] rounded-full bg-[#e8e0c8]/80'
                style={{ width: `${progress * 100}%` }}
              />
              <div
                className='absolute z-10 -translate-x-1/2 cursor-grab active:cursor-grabbing'
                style={{ left: `${progress * 100}%` }}
                onPointerDown={progressScrub.onPointerDown}
              >
                <Image
                  src='/assets/player-bar/dot.png'
                  alt='Scrubber'
                  width={14}
                  height={14}
                  className='h-3 w-3'
                  unoptimized
                  draggable={false}
                />
              </div>
              <div className='h-[3px] flex-1 rounded-full bg-[#e8e0c8]/20' />
            </div>
            <span className='w-9 font-[family-name:var(--font-akzidenz)] text-[10px] text-[#e8e0c8]/50 tabular-nums'>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume */}
        <div className='flex shrink-0 items-center justify-end gap-1 md:w-[30%]'>
          <button
            onClick={toggleMute}
            className='flex h-8 w-8 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            <Image
              src={isMuted ? '/assets/player-bar/mute.png' : '/assets/player-bar/sound.png'}
              alt={isMuted ? 'Silenciado' : 'Sonido'}
              width={18}
              height={18}
              className='h-3.5 w-auto'
              unoptimized
              draggable={false}
            />
          </button>
          <div
            className='relative flex h-3 w-20 cursor-pointer items-center'
            onClick={volumeScrub.onClick}
          >
            <div className='absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#e8e0c8]/20' />
            <div
              className='absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full bg-[#e8e0c8]/80'
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
            <div
              className='absolute z-10 cursor-grab active:cursor-grabbing'
              style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - ${(isMuted ? 0 : volume) * 10}px)` }}
              onPointerDown={volumeScrub.onPointerDown}
            >
              <Image
                src='/assets/player-bar/dot.png'
                alt='Volumen'
                width={10}
                height={10}
                className='h-2.5 w-2.5'
                unoptimized
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

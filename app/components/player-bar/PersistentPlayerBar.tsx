'use client'

import { TrackedProfileLink } from '@/app/components/analytics/TrackedProfileLink'
import { useCallback, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  usePlayerState,
  usePlayerActions,
  usePlayerSongs,
  useCurrentSong,
  usePlaybackContextId,
  usePlayerVolume
} from '@/app/hooks/usePlayerStore'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Carries the playing song/cassette into the profile URL so the "Conectar"
 *  flow there can attribute the interest_click back to this song. */
function buildArtistQuery(songId?: string | null, cassetteId?: string | null) {
  const params = new URLSearchParams()
  if (songId) params.set('song', songId)
  if (cassetteId) params.set('cassette', cassetteId)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/** Artist name in the bar: a tracked link to the band profile when one exists,
 *  plain text otherwise. Used by both the mobile and desktop layouts. */
function ArtistLabel({
  artist,
  artistSlug,
  href,
  songId,
  cassetteId,
  className
}: {
  artist: string
  artistSlug?: string
  href?: string
  songId?: string | null
  cassetteId?: string | null
  className: string
}) {
  if (!href) return <span className={className}>{artist}</span>
  return (
    <TrackedProfileLink
      href={href}
      targetProfileSlug={artistSlug}
      songId={songId}
      cassetteId={cassetteId}
      source='player_bar'
      title={`Ver perfil de ${artist}`}
      className={`${className} hover:underline`}
    >
      {artist}
    </TrackedProfileLink>
  )
}

export function PersistentPlayerBar() {
  const pathname = usePathname()
  const songs = usePlayerSongs()
  const currentSong = useCurrentSong()
  const contextId = usePlaybackContextId()
  const { isPlaying, progress, elapsedSeconds, duration } = usePlayerState()
  const { play, pause, next, prev, seek, startScrub, endScrub, setVolume, toggleMute } = usePlayerActions()
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
    (apply: (pct: number) => void, opts?: { onStart?: () => void; onCommit?: (pct: number | null) => void }) => ({
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {
        const pct = pctFromBar(e.currentTarget, e.clientX)
        if (pct !== null) {
          apply(pct)
          opts?.onCommit?.(pct)
        }
      },
      // The dot lives inside the bar; its parent is the track we measure against.
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        const bar = e.currentTarget.parentElement
        if (!bar) return
        e.preventDefault()
        opts?.onStart?.()
        let last: number | null = null
        const move = (ev: PointerEvent) => {
          const pct = pctFromBar(bar, ev.clientX)
          if (pct !== null) {
            last = pct
            apply(pct)
          }
        }
        const up = () => {
          document.removeEventListener('pointermove', move)
          document.removeEventListener('pointerup', up)
          opts?.onCommit?.(last)
        }
        document.addEventListener('pointermove', move)
        document.addEventListener('pointerup', up)
      }
    }),
    []
  )

  const progressScrub = makeScrub(seek, { onStart: startScrub, onCommit: endScrub })
  const volumeScrub = makeScrub(setVolume)

  // iOS forces audio volume to the hardware buttons (HTMLAudioElement.volume is
  // read-only), so a volume control there is dead UI — hide it. useSyncExternalStore
  // returns false on the server and the real value on the client without a
  // hydration mismatch.
  const isIOS = useSyncExternalStore(
    () => () => {},
    () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    () => false
  )

  // Don't render until songs are loaded
  if (songs.length === 0) return null

  // The "quienes somos" page is a full-screen video/manifesto experience with
  // its own audio; the global bar has no place there.
  if (pathname === '/quienes-somos') return null

  // On admin routes the full-height sidebar owns the left rail, so dock the bar
  // beside it (its width) instead of running underneath. Mobile keeps full width
  // since the sidebar is a drawer there.
  const isAdmin = pathname?.startsWith('/admin')

  const artistHref = currentSong?.artistSlug
    ? `/perfil/${currentSong.artistSlug}${buildArtistQuery(currentSong.id, contextId)}`
    : undefined

  return (
    <div
      className={`fixed right-0 bottom-0 left-0 z-50 border-t border-[#e8e0c8]/20 px-3 md:px-5 ${
        isAdmin ? 'md:left-64' : ''
      }`}
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
            <ArtistLabel
              artist={currentSong.artist}
              artistSlug={currentSong.artistSlug}
              href={artistHref}
              songId={currentSong.id}
              cassetteId={contextId}
              className='block truncate font-[family-name:var(--font-corose)] text-xs leading-tight text-[#e8e0c8]/50'
            />
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
              className='absolute z-10 cursor-grab active:cursor-grabbing'
              style={{ left: `calc(${progress * 100}% - ${progress * 12}px)` }}
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

        {/* Row 3: Transport controls — big and centered. Mute floats right so it
            doesn't shift the prev/play/next group off center. */}
        <div className='relative flex items-center justify-center gap-6'>
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

          {/* Mute toggle — kept on mobile (a quick silence the physical buttons
              can't do); the volume slider is dropped to save vertical space. */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            className='absolute top-1/2 right-0 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
          >
            <Image
              src={isMuted ? '/assets/player-bar/mute.png' : '/assets/player-bar/sound.png'}
              alt={isMuted ? 'Silenciado' : 'Sonido'}
              width={18}
              height={18}
              className='h-4 w-auto opacity-60'
              unoptimized
              draggable={false}
            />
          </button>
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
              <ArtistLabel
                artist={currentSong.artist}
                artistSlug={currentSong.artistSlug}
                href={artistHref}
                songId={currentSong.id}
                cassetteId={contextId}
                className='truncate font-[family-name:var(--font-corose)] text-base leading-tight text-[#e8e0c8]/50'
              />
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
                className='absolute z-10 cursor-grab active:cursor-grabbing'
                style={{ left: `calc(${progress * 100}% - ${progress * 12}px)` }}
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

        {/* Right: Volume — hidden on iOS (volume is hardware-controlled there). */}
        <div className={`flex shrink-0 items-center justify-end gap-1 md:w-[30%] ${isIOS ? 'hidden' : ''}`}>
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

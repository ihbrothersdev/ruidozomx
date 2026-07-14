'use client'

import { TrackedProfileLink } from '@/app/components/analytics/TrackedProfileLink'
import { cn } from '@/lib/utils'
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, type LucideIcon } from 'lucide-react'
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

/** Transport glyph — a cream PNG on the public dark bar, an ink lucide icon on
 *  the admin paper bar (where the PNGs would be invisible). */
function Glyph({
  admin,
  png,
  alt,
  w,
  imgClass,
  Icon,
  iconClass,
  fill = false
}: {
  admin: boolean
  png: string
  alt: string
  w: number
  imgClass: string
  Icon: LucideIcon
  iconClass: string
  fill?: boolean
}) {
  if (admin) return <Icon className={iconClass} {...(fill ? { fill: 'currentColor' } : {})} />
  return <Image src={png} alt={alt} width={w} height={w} className={imgClass} unoptimized draggable={false} />
}

/** Scrubber knob — the cream dot PNG publicly, a printed red knob on admin. */
function Dot({ admin, sizeClass }: { admin: boolean; sizeClass: string }) {
  if (admin) return <span className={cn('block rounded-full border-2 border-admin-ink bg-admin-red', sizeClass)} />
  return (
    <Image
      src='/assets/player-bar/dot.png'
      alt=''
      width={14}
      height={14}
      className={sizeClass}
      unoptimized
      draggable={false}
    />
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
  // since the sidebar is a drawer there. Admin also gets the "Mesa de Control"
  // paper skin: kraft surface, ink glyphs and a red transport — the cream PNGs
  // would vanish on paper.
  const admin = pathname?.startsWith('/admin') ?? false

  // Theme tokens shared by both layouts.
  const titleCls = admin ? 'text-admin-ink' : 'text-[#e8e0c8]'
  const subCls = admin ? 'text-admin-ink-soft' : 'text-[#e8e0c8]/50'
  const timeCls = admin ? 'text-admin-ink-faint' : 'text-[#e8e0c8]/50'
  const trackFill = admin ? 'bg-admin-red' : 'bg-[#e8e0c8]/80'
  const trackRest = admin ? 'bg-admin-ink/15' : 'bg-[#e8e0c8]/20'

  const artistHref = currentSong?.artistSlug
    ? `/perfil/${currentSong.artistSlug}${buildArtistQuery(currentSong.id, contextId)}`
    : undefined

  const playBtn = (size: 'sm' | 'lg') => {
    const box = size === 'lg' ? 'h-12 w-12' : 'h-9 w-9'
    const adminBox = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'
    const icon = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    if (admin) {
      return (
        <button
          onClick={isPlaying ? pause : play}
          className={cn(
            'admin-press flex cursor-pointer items-center justify-center rounded-full border-2 border-admin-ink bg-admin-red text-admin-surface',
            adminBox
          )}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <Pause className={icon} fill='currentColor' />
          ) : (
            <Play className={cn(icon, 'translate-x-0.5')} fill='currentColor' />
          )}
        </button>
      )
    }
    return (
      <button
        onClick={isPlaying ? pause : play}
        className={cn('flex cursor-pointer items-center justify-center transition-opacity hover:opacity-80', box)}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        <Image
          src={isPlaying ? '/assets/player-bar/pause.png' : '/assets/player-bar/play.png'}
          alt={isPlaying ? 'Pausar' : 'Reproducir'}
          width={size === 'lg' ? 36 : 24}
          height={size === 'lg' ? 36 : 24}
          className={size === 'lg' ? 'h-8 w-auto' : 'h-5 w-auto'}
          unoptimized
          draggable={false}
        />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 left-0 z-50 px-3 md:px-5',
        admin ? 'border-t-2 border-admin-ink bg-admin-surface md:left-64' : 'border-t border-[#e8e0c8]/20'
      )}
      style={
        admin
          ? { boxShadow: '0 -6px 18px rgba(23,19,13,0.07)' }
          : {
              backgroundImage: "url('/assets/player-bar/background.png')",
              backgroundRepeat: 'repeat-x',
              backgroundSize: 'auto 100%',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.6)'
            }
      }
    >
      {/* ── MOBILE: Apple Music-style stacked layout ────────────── */}
      <div className='flex flex-col gap-1.5 px-1 py-2 md:hidden'>
        {/* Row 1: Song title + artist */}
        {currentSong && (
          <div className='text-center'>
            <span
              className={cn(
                'block truncate font-[family-name:var(--font-corose)] text-base leading-tight font-semibold',
                titleCls
              )}
            >
              {currentSong.title}
            </span>
            <ArtistLabel
              artist={currentSong.artist}
              artistSlug={currentSong.artistSlug}
              href={artistHref}
              songId={currentSong.id}
              cassetteId={contextId}
              className={cn('block truncate font-[family-name:var(--font-corose)] text-xs leading-tight', subCls)}
            />
          </div>
        )}

        {/* Row 2: Progress bar + timestamps */}
        <div className='flex items-center gap-2'>
          <span className={cn('w-8 text-right font-[family-name:var(--font-akzidenz)] text-[10px] tabular-nums', timeCls)}>
            {formatTime(elapsedSeconds)}
          </span>
          <div
            className='relative flex h-3 flex-1 cursor-pointer items-center'
            onClick={progressScrub.onClick}
          >
            <div
              className={cn('h-[3px] rounded-full', trackFill)}
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className='absolute z-10 cursor-grab active:cursor-grabbing'
              style={{ left: `calc(${progress * 100}% - ${progress * 12}px)` }}
              onPointerDown={progressScrub.onPointerDown}
            >
              <Dot admin={admin} sizeClass='h-3 w-3' />
            </div>
            <div className={cn('h-[3px] flex-1 rounded-full', trackRest)} />
          </div>
          <span className={cn('w-8 font-[family-name:var(--font-akzidenz)] text-[10px] tabular-nums', timeCls)}>
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
            <Glyph
              admin={admin}
              png='/assets/player-bar/previous.png'
              alt='Anterior'
              w={28}
              imgClass='h-6 w-auto'
              Icon={SkipBack}
              iconClass='h-6 w-6 text-admin-ink'
              fill
            />
          </button>
          {playBtn('lg')}
          <button
            onClick={next}
            className='flex h-10 w-10 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
            aria-label='Siguiente'
          >
            <Glyph
              admin={admin}
              png='/assets/player-bar/forward.png'
              alt='Siguiente'
              w={28}
              imgClass='h-6 w-auto'
              Icon={SkipForward}
              iconClass='h-6 w-6 text-admin-ink'
              fill
            />
          </button>

          {/* Mute toggle — kept on mobile (a quick silence the physical buttons
              can't do); the volume slider is dropped to save vertical space. */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            className='absolute top-1/2 right-0 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
          >
            <Glyph
              admin={admin}
              png={isMuted ? '/assets/player-bar/mute.png' : '/assets/player-bar/sound.png'}
              alt={isMuted ? 'Silenciado' : 'Sonido'}
              w={18}
              imgClass='h-4 w-auto opacity-60'
              Icon={isMuted ? VolumeX : Volume2}
              iconClass='h-4 w-4 text-admin-ink-soft'
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
              <span className={cn('truncate font-[family-name:var(--font-corose)] text-lg leading-tight', titleCls)}>
                {currentSong.title}
              </span>
              <ArtistLabel
                artist={currentSong.artist}
                artistSlug={currentSong.artistSlug}
                href={artistHref}
                songId={currentSong.id}
                cassetteId={contextId}
                className={cn('truncate font-[family-name:var(--font-corose)] text-base leading-tight', subCls)}
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
              <Glyph
                admin={admin}
                png='/assets/player-bar/previous.png'
                alt='Anterior'
                w={20}
                imgClass='h-4 w-auto'
                Icon={SkipBack}
                iconClass='h-4 w-4 text-admin-ink'
                fill
              />
            </button>
            {playBtn('sm')}
            <button
              onClick={next}
              className='flex h-8 w-8 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
              aria-label='Siguiente'
            >
              <Glyph
                admin={admin}
                png='/assets/player-bar/forward.png'
                alt='Siguiente'
                w={20}
                imgClass='h-4 w-auto'
                Icon={SkipForward}
                iconClass='h-4 w-4 text-admin-ink'
                fill
              />
            </button>
          </div>

          <div className='flex w-full max-w-xl items-center gap-2'>
            <span className={cn('w-9 text-right font-[family-name:var(--font-akzidenz)] text-[10px] tabular-nums', timeCls)}>
              {formatTime(elapsedSeconds)}
            </span>
            <div
              className='relative flex h-3 flex-1 cursor-pointer items-center'
              onClick={progressScrub.onClick}
            >
              <div
                className={cn('h-[3px] rounded-full', trackFill)}
                style={{ width: `${progress * 100}%` }}
              />
              <div
                className='absolute z-10 cursor-grab active:cursor-grabbing'
                style={{ left: `calc(${progress * 100}% - ${progress * 12}px)` }}
                onPointerDown={progressScrub.onPointerDown}
              >
                <Dot admin={admin} sizeClass='h-3 w-3' />
              </div>
              <div className={cn('h-[3px] flex-1 rounded-full', trackRest)} />
            </div>
            <span className={cn('w-9 font-[family-name:var(--font-akzidenz)] text-[10px] tabular-nums', timeCls)}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume — hidden on iOS (volume is hardware-controlled there). */}
        <div className={cn('flex shrink-0 items-center justify-end gap-1 md:w-[30%]', isIOS && 'hidden')}>
          <button
            onClick={toggleMute}
            className='flex h-8 w-8 cursor-pointer items-center justify-center transition-opacity hover:opacity-80'
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            <Glyph
              admin={admin}
              png={isMuted ? '/assets/player-bar/mute.png' : '/assets/player-bar/sound.png'}
              alt={isMuted ? 'Silenciado' : 'Sonido'}
              w={18}
              imgClass='h-3.5 w-auto'
              Icon={isMuted ? VolumeX : Volume2}
              iconClass='h-4 w-4 text-admin-ink-soft'
            />
          </button>
          <div
            className='relative flex h-3 w-20 cursor-pointer items-center'
            onClick={volumeScrub.onClick}
          >
            <div className={cn('absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full', trackRest)} />
            <div
              className={cn('absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full', trackFill)}
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
            <div
              className='absolute z-10 cursor-grab active:cursor-grabbing'
              style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - ${(isMuted ? 0 : volume) * 10}px)` }}
              onPointerDown={volumeScrub.onPointerDown}
            >
              <Dot admin={admin} sizeClass='h-2.5 w-2.5' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

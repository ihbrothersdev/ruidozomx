'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { hasEmbed } from './ProposalEmbed'

type PlayerState = 'idle' | 'loading' | 'ready' | 'playing' | 'error'

export function InlinePlayer({ audioUrl }: { audioUrl?: string | null }) {
  if (!audioUrl) return null
  if (hasEmbed(audioUrl)) return null

  return <PlayerInner url={audioUrl} />
}

function PlayerInner({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<PlayerState>('idle')
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const directUrl = toDirectUrl(url)
  const isDirectAudio = /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i.test(url)

  const handlePlay = useCallback(() => {
    if (state === 'playing') {
      audioRef.current?.pause()
      setState('ready')
      return
    }

    if (state === 'ready' && audioRef.current) {
      audioRef.current.play().catch(() => setState('error'))
      return
    }

    // First time — create audio and try loading
    setState('loading')
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.preload = 'auto'
    audioRef.current = audio

    audio.addEventListener('canplay', () => {
      setState('playing')
      audio.play().catch(() => setState('error'))
    })

    audio.addEventListener('error', () => setState('error'))

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
      if (audio.duration) setProgress(audio.currentTime / audio.duration)
    })

    audio.addEventListener('durationchange', () => setDuration(audio.duration || 0))

    audio.addEventListener('ended', () => {
      setState('ready')
      setProgress(0)
      setCurrentTime(0)
    })

    audio.addEventListener('pause', () => {
      if (state !== 'error') setState('ready')
    })

    audio.addEventListener('play', () => setState('playing'))

    audio.src = directUrl
  }, [state, directUrl])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = pct * audio.duration
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const label = isDirectAudio ? 'Reproducir audio' : 'Intentar reproducir'

  return (
    <div className='flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3'>
      {/* Play / Pause / Loading button */}
      <button
        onClick={handlePlay}
        disabled={state === 'loading'}
        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-500 disabled:cursor-wait disabled:opacity-60'
        title={label}
      >
        {state === 'loading' ? (
          <svg
            className='h-4 w-4 animate-spin'
            viewBox='0 0 24 24'
            fill='none'
          >
            <circle
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='3'
              className='opacity-25'
            />
            <path
              d='M4 12a8 8 0 018-8'
              stroke='currentColor'
              strokeWidth='3'
              strokeLinecap='round'
              className='opacity-75'
            />
          </svg>
        ) : state === 'playing' ? (
          <svg
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-4 w-4'
          >
            <rect
              x='6'
              y='4'
              width='4'
              height='16'
              rx='1'
            />
            <rect
              x='14'
              y='4'
              width='4'
              height='16'
              rx='1'
            />
          </svg>
        ) : (
          <svg
            viewBox='0 0 24 24'
            fill='currentColor'
            className='h-4 w-4 translate-x-0.5'
          >
            <path d='M8 5v14l11-7z' />
          </svg>
        )}
      </button>

      {/* Progress bar + time */}
      <div className='min-w-0 flex-1'>
        {state === 'error' ? (
          <div className='space-y-1'>
            <p className='font-pt-mono text-[11px] text-white/30'>No se puede reproducir desde aquí</p>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='font-pt-mono inline-block text-[11px] text-red-400 underline hover:text-red-300'
            >
              Abrir link directamente ↗
            </a>
          </div>
        ) : state === 'idle' ? (
          <p className='font-pt-mono text-[11px] text-white/40'>{label}</p>
        ) : (
          <>
            <div
              className='cursor-pointer rounded-full bg-white/10 p-0.5'
              onClick={handleSeek}
            >
              <div
                className='h-1 rounded-full bg-red-500 transition-all duration-150'
                style={{ width: `${Math.max(0.5, progress * 100)}%` }}
              />
            </div>
            {duration > 0 && (
              <div className='font-pt-mono mt-1 flex justify-between text-[10px] text-white/25'>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** Convert known cloud URLs to direct download links */
function toDirectUrl(url: string): string {
  // Dropbox: change dl=0 to dl=1, or add dl=1
  if (url.includes('dropbox.com')) {
    return url.replace('dl=0', 'dl=1').replace(/\?$/, '') + (url.includes('dl=') ? '' : '?dl=1')
  }
  // Google Drive: extract file ID and convert
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`
  }
  return url
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

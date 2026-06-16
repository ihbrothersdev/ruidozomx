'use client'

import { updateSongDuration } from '@/app/admin/actions'
import { Card, CardContent } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'
import { isPlayableAudio } from '@/lib/audio'
import { Loader2, Pause, Play } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { RemoveSongButton } from './CassetteActions'
import { UploadAudioButton } from './UploadAudioButton'

type Side = 'A' | 'B'

export type CassetteSong = {
  id: string
  title: string
  artist: string
  side: Side
  position: number
  plays: number
  audioUrl: string | null
  durationSeconds: number | null
}

const SIZE = 13

function isDirectAudioUrl(url: string | null): boolean {
  if (!url) return false
  if (/\.(mp3|m4a|wav|ogg|aac|flac)(\?|$)/i.test(url)) return true
  if (/drive\.google\.com/.test(url)) return true
  if (/dropbox\.com/.test(url)) return true
  return false
}

function normalizeAudioUrl(url: string): string {
  if (/drive\.google\.com\/file\/d\//.test(url)) {
    const m = url.match(/\/d\/([^/]+)/)
    if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`
  }
  if (/dropbox\.com/.test(url))
    return url.replace('?dl=0', '?dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com')
  return url
}

function formatTime(seconds: number | null): string {
  if (!seconds || seconds <= 0) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function parseTime(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) return Number(trimmed)
  const m = trimmed.match(/^(\d+):([0-5]?\d)$/)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

// ─── Audio preview (one track plays at a time across both sides) ──────────────

type PreviewStatus = 'loading' | 'playing'

const AudioPreviewContext = createContext<{
  activeId: string | null
  status: PreviewStatus | null
  toggle: (id: string, url: string) => void
} | null>(null)

function AudioPreviewProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [status, setStatus] = useState<PreviewStatus | null>(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setActiveId(null)
    setStatus(null)
  }, [])

  const toggle = useCallback(
    (id: string, url: string) => {
      // Clicking the track that's already active stops it.
      if (audioRef.current && activeId === id) {
        stop()
        return
      }
      stop()
      // No crossOrigin: plain playback of cross-origin audio doesn't need CORS,
      // and requiring it would break if the bucket didn't send the headers.
      const audio = new Audio()
      audio.preload = 'auto'
      audioRef.current = audio
      setActiveId(id)
      setStatus('loading')
      audio.addEventListener('playing', () => setStatus('playing'))
      audio.addEventListener('ended', stop)
      audio.addEventListener('error', stop)
      audio.src = url
      audio.play().catch(stop)
    },
    [activeId, stop]
  )

  useEffect(() => stop, [stop])

  return <AudioPreviewContext.Provider value={{ activeId, status, toggle }}>{children}</AudioPreviewContext.Provider>
}

function PreviewButton({ songId, url, playable }: { songId: string; url: string | null; playable: boolean }) {
  const ctx = useContext(AudioPreviewContext)
  const isActive = ctx?.activeId === songId
  const status = isActive ? ctx?.status : null
  const disabled = !playable || !url

  const label = disabled ? 'Sin MP3 reproducible' : status === 'playing' ? 'Pausar' : 'Escuchar para verificar'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type='button'
            disabled={disabled}
            onClick={() => url && ctx?.toggle(songId, url)}
            aria-label={label}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
              disabled
                ? 'cursor-not-allowed bg-white/5 text-white/20'
                : isActive
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {status === 'loading' ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : status === 'playing' ? (
              <Pause className='h-3.5 w-3.5 fill-current' />
            ) : (
              <Play className='h-3.5 w-3.5 translate-x-px fill-current' />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function CassetteSides({
  cassetteId,
  songs,
  canRemove
}: {
  cassetteId: string
  songs: CassetteSong[]
  canRemove: boolean
}) {
  const sideA = songs.filter(s => s.side === 'A').sort((a, b) => a.position - b.position)
  const sideB = songs.filter(s => s.side === 'B').sort((a, b) => a.position - b.position)

  return (
    <AudioPreviewProvider>
      <section className='grid gap-4 xl:grid-cols-2'>
        <SideCard
          side='A'
          songs={sideA}
          cassetteId={cassetteId}
          canRemove={canRemove}
        />
        <SideCard
          side='B'
          songs={sideB}
          cassetteId={cassetteId}
          canRemove={canRemove}
        />
      </section>
    </AudioPreviewProvider>
  )
}

function SideCard({
  side,
  songs,
  cassetteId,
  canRemove
}: {
  side: Side
  songs: CassetteSong[]
  cassetteId: string
  canRemove: boolean
}) {
  const sideCls = side === 'A' ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-blue-500/20 bg-blue-500/[0.03]'
  const badgeCls = side === 'A' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
  // Sides normally cap at 13, but one may hold more (e.g. Cassette 3 has 14 on A).
  // Render as many slots as the highest occupied position so nothing is hidden.
  const count = songs.reduce((m, s) => Math.max(m, s.position), SIZE)

  return (
    <Card className={`gap-4 border py-5 ${sideCls}`}>
      <CardContent>
        <div className='mb-4 flex items-center gap-2'>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${badgeCls}`}>
            {side}
          </div>
          <p className='font-pt-mono text-[11px] font-bold tracking-widest text-white/60 uppercase'>
            Lado {side} · {songs.length}/{count}
          </p>
        </div>

        <ol className='space-y-1'>
          {Array.from({ length: count }, (_, i) => i + 1).map(pos => {
            const song = songs.find(s => s.position === pos)
            if (!song) {
              return (
                <li
                  key={pos}
                  className='font-pt-mono flex items-center gap-3 rounded-lg border border-dashed border-white/5 px-2.5 py-2 text-[11px] text-white/20 sm:px-3'
                >
                  <span className='w-5 text-right'>#{pos}</span>
                  <span className='italic'>vacío</span>
                </li>
              )
            }
            const playable = isPlayableAudio(song.audioUrl)
            return (
              <li
                key={pos}
                className='flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg border border-white/10 bg-white/4 px-2.5 py-2 sm:gap-x-3 sm:px-3'
              >
                <span className='font-pt-mono w-5 shrink-0 text-right text-[11px] text-white/40'>#{pos}</span>
                <PreviewButton
                  songId={song.id}
                  url={song.audioUrl}
                  playable={playable}
                />
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-1.5'>
                    <p className='font-pt-mono truncate text-xs font-bold text-white'>{song.artist}</p>
                    <AudioStatusDot
                      playable={playable}
                      hasAny={!!song.audioUrl}
                    />
                  </div>
                  <p className='font-pt-mono truncate text-[10px] text-white/40'>{song.title}</p>
                </div>
                {/* Controls cluster — wraps under the title on narrow screens. */}
                <div className='ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2'>
                  <DurationCell
                    song={song}
                    cassetteId={cassetteId}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className='font-pt-mono inline-flex w-11 items-center justify-end gap-1 text-[10px] text-white/40'>
                          <Play className='h-2.5 w-2.5 fill-current' />
                          {song.plays.toLocaleString('es-MX')}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {song.plays === 1 ? '1 reproducción' : `${song.plays.toLocaleString('es-MX')} reproducciones`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {canRemove && (
                    <UploadAudioButton
                      songId={song.id}
                      cassetteId={cassetteId}
                      playable={playable}
                    />
                  )}
                  {canRemove && (
                    <RemoveSongButton
                      songId={song.id}
                      cassetteId={cassetteId}
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

function AudioStatusDot({ playable, hasAny }: { playable: boolean; hasAny: boolean }) {
  const tone = playable ? 'bg-emerald-400' : hasAny ? 'bg-amber-400' : 'bg-white/20'
  const label = playable
    ? 'MP3 reproducible'
    : hasAny
      ? 'Solo link externo (no se puede reproducir, sube el MP3)'
      : 'Sin audio'
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function DurationCell({ song, cassetteId }: { song: CassetteSong; cassetteId: string }) {
  const [seconds, setSeconds] = useState<number | null>(song.durationSeconds)
  const [text, setText] = useState(formatTime(song.durationSeconds))
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const triedAutoRef = useRef(false)

  // Sync state when the song prop's duration changes (e.g. server revalidation
  // after another admin edits it). The ESLint rule prefers `key`-based resets,
  // but here the same component instance must keep `editing`/`saving` state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeconds(song.durationSeconds)
    setText(formatTime(song.durationSeconds))
  }, [song.durationSeconds])

  // Auto-detect duration for direct audio URLs (only once per song instance, when missing)
  useEffect(() => {
    if (seconds || triedAutoRef.current) return
    if (!isDirectAudioUrl(song.audioUrl)) return
    triedAutoRef.current = true
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.src = normalizeAudioUrl(song.audioUrl as string)
    const onLoaded = async () => {
      const detected = Math.round(audio.duration)
      if (!Number.isFinite(detected) || detected <= 0) return
      setSeconds(detected)
      setText(formatTime(detected))
      setSaving(true)
      const res = await updateSongDuration({ songId: song.id, cassetteId, durationSeconds: detected })
      setSaving(false)
      if (!res.ok) setError(true)
    }
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('error', () => {
      // silent: leave as null, admin can type it
    })
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.src = ''
    }
  }, [song.audioUrl, song.id, cassetteId, seconds])

  async function commit() {
    setEditing(false)
    setError(false)
    const parsed = text.trim() === '' ? null : parseTime(text)
    if (text.trim() !== '' && parsed === null) {
      setError(true)
      setText(formatTime(seconds))
      return
    }
    if (parsed === seconds) return
    setSaving(true)
    const res = await updateSongDuration({ songId: song.id, cassetteId, durationSeconds: parsed })
    setSaving(false)
    if (!res.ok) {
      setError(true)
      setText(formatTime(seconds))
    } else {
      setSeconds(parsed)
      setText(formatTime(parsed))
    }
  }

  if (editing) {
    return (
      <Input
        type='text'
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            ;(e.target as HTMLInputElement).blur()
          }
          if (e.key === 'Escape') {
            setText(formatTime(seconds))
            setEditing(false)
          }
        }}
        placeholder='3:42'
        className='font-pt-mono h-7 w-16 rounded border-white/20 bg-black/40 px-1.5 py-0.5 text-[10px] text-white focus-visible:border-red-500/50 focus-visible:ring-red-500/20'
      />
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type='button'
            onClick={() => setEditing(true)}
            className={`font-pt-mono w-14 rounded px-1.5 py-0.5 text-right text-[10px] transition-colors ${
              error
                ? 'text-red-400 hover:bg-red-500/10'
                : seconds
                  ? 'text-white/60 hover:bg-white/10 hover:text-white'
                  : 'text-white/20 hover:bg-white/10 hover:text-white/60'
            } ${saving ? 'animate-pulse' : ''}`}
          >
            {seconds ? formatTime(seconds) : '—'}
          </button>
        </TooltipTrigger>
        <TooltipContent>Editar duración (mm:ss o segundos)</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

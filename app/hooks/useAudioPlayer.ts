'use client'

import { logEvent, type SongEventType } from '@/app/analytics/actions'
import { getAnonSessionId } from '@/lib/analytics/session'
import type { PlayerSong } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'

interface AudioPlayerState {
  isPlaying: boolean
  currentSongId: string
  isStopped: boolean
  currentSide: 'A' | 'B'
  elapsedSeconds: number
  duration: number
  progress: number
}

interface AudioPlayerActions {
  play: () => void
  pause: () => void
  stop: () => void
  next: () => void
  prev: () => void
  seek: (progress: number) => void
  playSong: (id: string) => void
}

/**
 * Pool entry for a single song.
 * - `audio` is created once and reused; its src is set to a `blob:` URL once
 *   the file is fully downloaded, which makes `play()` strictly synchronous
 *   (no network, no buffering).
 * - While the blob is loading, `audio.src` stays empty so we don't waste
 *   bandwidth on the browser's own (unpredictable) preload heuristics.
 */
interface PoolEntry {
  audio: HTMLAudioElement
  blobUrl: string | null
  status: 'idle' | 'loading' | 'ready' | 'error'
}

const MAX_CONCURRENT_FETCHES = 3

export function useAudioPlayer(
  songs: PlayerSong[],
  initialSongId: string,
  cassetteId: string | null = null
): AudioPlayerState & AudioPlayerActions {
  const poolRef = useRef<Map<string, PoolEntry>>(new Map())
  const activeRef = useRef<HTMLAudioElement | null>(null)
  const queueRef = useRef<string[]>([])
  const inFlightRef = useRef<Set<string>>(new Set())
  const wantPlayOnReadyRef = useRef<Set<string>>(new Set())

  const [currentSongId, setCurrentSongId] = useState(initialSongId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStopped, setIsStopped] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [duration, setDuration] = useState(0)

  // ──────────────────────────────────────────────────────────────────────────
  // Analytics tracking
  // ──────────────────────────────────────────────────────────────────────────
  const sessionIdRef = useRef<string>('')
  const sessionStartedRef = useRef(false)
  const playStartLoggedForRef = useRef<string | null>(null)
  const completedSongsRef = useRef<Set<string>>(new Set())

  const emit = useCallback(
    (type: SongEventType, songId: string | null, metadata?: Record<string, unknown>) => {
      if (!cassetteId && !songId) return
      void logEvent({
        type,
        songId,
        cassetteId,
        sessionId: sessionIdRef.current || null,
        metadata
      }).catch(() => {})
    },
    [cassetteId]
  )

  useEffect(() => {
    sessionIdRef.current = getAnonSessionId()
  }, [])

  const sortedSongsRef = useRef<PlayerSong[]>([])
  sortedSongsRef.current = [...songs].sort((a, b) => {
    if (a.side !== b.side) return a.side === 'A' ? -1 : 1
    return a.position - b.position
  })

  const currentSong = songs.find(s => s.id === currentSongId)
  const currentSide = currentSong?.side ?? 'A'
  const progress = duration > 0 ? elapsedSeconds / duration : 0

  /** Get (or lazily create) the pool entry for a song. */
  const getEntry = useCallback((song: PlayerSong): PoolEntry => {
    const pool = poolRef.current
    let entry = pool.get(song.id)
    if (!entry) {
      const audio = new Audio()
      // We control buffering ourselves via fetch+blob. Tell the browser not to
      // start its own (often partial / throttled) preload.
      audio.preload = 'none'
      entry = { audio, blobUrl: null, status: 'idle' }
      pool.set(song.id, entry)
    }
    return entry
  }, [])

  /** Drain the priority queue, keeping at most MAX_CONCURRENT_FETCHES active. */
  const pump = useCallback(() => {
    const queue = queueRef.current
    const inFlight = inFlightRef.current
    const sorted = sortedSongsRef.current

    while (inFlight.size < MAX_CONCURRENT_FETCHES && queue.length > 0) {
      const id = queue.shift()!
      const song = sorted.find(s => s.id === id)
      if (!song || !song.audioSrc) continue

      const entry = getEntry(song)
      if (entry.status === 'ready' || entry.status === 'loading') continue

      entry.status = 'loading'
      inFlight.add(id)

      fetch(song.audioSrc, { cache: 'force-cache' })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.blob()
        })
        .then(blob => {
          const url = URL.createObjectURL(blob)
          entry.blobUrl = url
          entry.status = 'ready'
          // Only assign src now that the file is fully in memory.
          // If the audio element's src was previously empty, we set it; if it
          // was already pointing to a (stale) blob, replace it.
          if (entry.audio.src !== url) entry.audio.src = url

          // If someone clicked play before the blob was ready, fulfill it now.
          if (wantPlayOnReadyRef.current.has(song.id)) {
            wantPlayOnReadyRef.current.delete(song.id)
            entry.audio.play().catch(() => {})
          }
        })
        .catch(() => {
          // Network failure: fall back to streaming the URL directly so the
          // user still gets audio (just not strictly zero-delay).
          entry.status = 'error'
          if (entry.audio.src !== song.audioSrc) entry.audio.src = song.audioSrc
          if (wantPlayOnReadyRef.current.has(song.id)) {
            wantPlayOnReadyRef.current.delete(song.id)
            entry.audio.play().catch(() => {})
          }
        })
        .finally(() => {
          inFlight.delete(id)
          // Continue draining.
          pump()
        })
    }
  }, [getEntry])

  /** Push an id to the front of the queue (highest priority). */
  const prioritize = useCallback(
    (id: string) => {
      const queue = queueRef.current
      const idx = queue.indexOf(id)
      if (idx >= 0) queue.splice(idx, 1)
      queue.unshift(id)
      pump()
    },
    [pump]
  )

  /** Build the initial queue ordered by playback proximity to the current song. */
  useEffect(() => {
    const sorted = sortedSongsRef.current
    if (sorted.length === 0) return

    const startIdx = Math.max(
      0,
      sorted.findIndex(s => s.id === currentSongId)
    )

    // Interleave forward/backward neighbors so the next track is always next
    // in line, then the previous, then the next-next, etc.
    const ordered: string[] = []
    ordered.push(sorted[startIdx].id)
    for (let offset = 1; offset < sorted.length; offset++) {
      const fwd = sorted[startIdx + offset]
      const bwd = sorted[startIdx - offset]
      if (fwd) ordered.push(fwd.id)
      if (bwd) ordered.push(bwd.id)
    }

    queueRef.current = ordered
    pump()
    // Run once on mount (and if the song list identity ever changes).
  }, [songs, pump, currentSongId])

  /** Wire up the active audio element when currentSongId changes. */
  useEffect(() => {
    if (!currentSong) return

    const previous = activeRef.current
    if (previous) {
      previous.pause()
      previous.removeEventListener('timeupdate', onTimeUpdate)
      previous.removeEventListener('durationchange', onDurationChange)
      previous.removeEventListener('ended', onEnded)
      previous.removeEventListener('play', onPlay)
      previous.removeEventListener('pause', onPause)
    }

    const entry = getEntry(currentSong)
    const audio = entry.audio
    activeRef.current = audio

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    setElapsedSeconds(Math.floor(audio.currentTime))
    setDuration(Math.floor(audio.duration) || 0)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongId])

  function onTimeUpdate() {
    const a = activeRef.current
    if (a) setElapsedSeconds(Math.floor(a.currentTime))
  }
  function onDurationChange() {
    const a = activeRef.current
    if (a) setDuration(Math.floor(a.duration) || 0)
  }
  function onEnded() {
    const songId = currentSongId
    if (songId && !completedSongsRef.current.has(songId)) {
      completedSongsRef.current.add(songId)
      emit('play_complete', songId, {
        duration_listened: Math.round(activeRef.current?.duration ?? 0)
      })
    }
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === songId)
    if (idx < sorted.length - 1) {
      const nextId = sorted[idx + 1].id
      setCurrentSongId(nextId)
      // Try to start the next one as soon as the effect rebinds activeRef.
      // Schedule on the microtask queue so React commits the state first.
      queueMicrotask(() => {
        const nextEntry = poolRef.current.get(nextId)
        if (!nextEntry) return
        if (nextEntry.status === 'ready') {
          nextEntry.audio.play().catch(() => {})
        } else {
          wantPlayOnReadyRef.current.add(nextId)
          prioritize(nextId)
        }
      })
    } else {
      setCurrentSongId(sorted[0].id)
      setIsPlaying(false)
    }
  }
  function onPlay() {
    setIsPlaying(true)
    setIsStopped(false)
    // Update OS-level UI immediately — don't wait for React's effect cycle.
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing'
    }
    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true
      emit('cassette_session_start', null, { initial_song_id: currentSongId })
    }
    if (playStartLoggedForRef.current !== currentSongId) {
      playStartLoggedForRef.current = currentSongId
      const song = songs.find(s => s.id === currentSongId)
      emit('play_start', currentSongId, {
        side: song?.side,
        position: song?.position
      })
    }
  }
  function onPause() {
    setIsPlaying(false)
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused'
    }
  }

  // Reset the play_start dedup flag when the active song changes,
  // so the next time the user presses Play we log a new event.
  useEffect(() => {
    playStartLoggedForRef.current = null
  }, [currentSongId])

  /** Cleanup pool on unmount + emit cassette_session_end if a session was open. */
  useEffect(() => {
    const onBeforeUnload = () => {
      if (sessionStartedRef.current) {
        emit('cassette_session_end', null, {
          last_song_id: currentSongId,
          elapsed_seconds: Math.round(activeRef.current?.currentTime ?? 0)
        })
        sessionStartedRef.current = false
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    const pool = poolRef.current
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      if (sessionStartedRef.current) {
        emit('cassette_session_end', null, {
          last_song_id: currentSongId,
          elapsed_seconds: Math.round(activeRef.current?.currentTime ?? 0)
        })
        sessionStartedRef.current = false
      }
      pool.forEach(entry => {
        entry.audio.pause()
        entry.audio.removeAttribute('src')
        entry.audio.load()
        if (entry.blobUrl) URL.revokeObjectURL(entry.blobUrl)
      })
      pool.clear()
      queueRef.current = []
      inFlightRef.current.clear()
      wantPlayOnReadyRef.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── MediaSession: lock screen / notification / car / Bluetooth controls ──
  // Sets the now-playing metadata (title, artist, artwork) and action handlers
  // so the OS-level media controls work and show the Ruidozo branding.
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
    if (!currentSong) return

    const artworkUrl = `${window.location.origin}/assets/quienes-somos/rayo.png`
    navigator.mediaSession.metadata = new MediaMetadata({
      // Line 1 on the lock screen: "Canción - Autor"
      title: `${currentSong.title} - ${currentSong.artist}`,
      // Line 2 on the lock screen: brand
      artist: 'Ruidozo MX',
      album: 'Cassette semanal',
      artwork: [
        { src: artworkUrl, sizes: '96x96', type: 'image/png' },
        { src: artworkUrl, sizes: '192x192', type: 'image/png' },
        { src: artworkUrl, sizes: '256x256', type: 'image/png' },
        { src: artworkUrl, sizes: '384x384', type: 'image/png' },
        { src: artworkUrl, sizes: '512x512', type: 'image/png' }
      ]
    })
  }, [currentSong])

  // Keep MediaSession playback state in sync so the OS shows the correct play/pause icon.
  // We also push the value directly inside the audio element's onPlay/onPause listeners
  // (see below) because iOS Safari sometimes reads playbackState faster than React's
  // state-driven re-render can catch up.
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  const play = useCallback(() => {
    setIsStopped(false)
    const audio = activeRef.current
    if (!audio) return
    // If the blob isn't ready yet, mark it so the fetch resolver fires play().
    const entry = poolRef.current.get(currentSongId)
    if (entry && entry.status !== 'ready') {
      wantPlayOnReadyRef.current.add(currentSongId)
      prioritize(currentSongId)
      return
    }
    audio.play().catch(() => {})
  }, [currentSongId, prioritize])

  const pause = useCallback(() => {
    activeRef.current?.pause()
  }, [])

  const stop = useCallback(() => {
    const audio = activeRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setElapsedSeconds(0)
    setIsStopped(true)
  }, [])

  const next = useCallback(() => {
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongId)
    if (idx < sorted.length - 1) {
      const nextId = sorted[idx + 1].id
      setCurrentSongId(nextId)
      prioritize(nextId)
    }
  }, [currentSongId, prioritize])

  const prev = useCallback(() => {
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongId)
    if (idx > 0) {
      const prevId = sorted[idx - 1].id
      setCurrentSongId(prevId)
      prioritize(prevId)
    }
  }, [currentSongId, prioritize])

  const seek = useCallback((pct: number) => {
    const audio = activeRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = pct * audio.duration
  }, [])

  // Wire MediaSession action handlers so OS-level controls (lock screen, notification,
  // headphones, Bluetooth, CarPlay/Android Auto, steering wheel) drive the player.
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return

    const setHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        // Action not supported on this platform — ignore.
      }
    }

    setHandler('play', () => play())
    setHandler('pause', () => pause())
    setHandler('previoustrack', () => prev())
    setHandler('nexttrack', () => next())
    setHandler('stop', () => stop())
    setHandler('seekto', details => {
      const audio = activeRef.current
      if (!audio || details.seekTime == null) return
      audio.currentTime = details.seekTime
    })
    setHandler('seekbackward', details => {
      const audio = activeRef.current
      if (!audio) return
      audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset ?? 10))
    })
    setHandler('seekforward', details => {
      const audio = activeRef.current
      if (!audio) return
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (details.seekOffset ?? 10))
    })

    return () => {
      ;(['play', 'pause', 'previoustrack', 'nexttrack', 'stop', 'seekto', 'seekbackward', 'seekforward'] as MediaSessionAction[]).forEach(a =>
        setHandler(a, null)
      )
    }
  }, [play, pause, next, prev, stop])

  // Keep MediaSession position state up-to-date so scrubbers in the OS UI work
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return
    if (!duration) return
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.min(elapsedSeconds, duration),
        playbackRate: activeRef.current?.playbackRate ?? 1
      })
    } catch {
      // Some browsers throw if values are inconsistent — safe to ignore.
    }
  }, [elapsedSeconds, duration])

  const playSong = useCallback(
    (id: string) => {
      // Stop the currently active element (don't reset its time — the next
      // mount will set up the new one).
      const current = activeRef.current
      if (current) current.pause()

      setIsStopped(false)
      setCurrentSongId(id)

      const entry = poolRef.current.get(id) ?? getEntry(songs.find(s => s.id === id)!)
      // Always start from the beginning when explicitly selecting a song.
      if (entry.audio.currentTime !== 0) entry.audio.currentTime = 0

      if (entry.status === 'ready') {
        entry.audio.play().catch(() => {})
      } else {
        wantPlayOnReadyRef.current.add(id)
        prioritize(id)
      }
    },
    [songs, getEntry, prioritize]
  )

  return {
    isPlaying,
    isStopped,
    currentSongId,
    currentSide,
    elapsedSeconds,
    duration,
    progress,
    play,
    pause,
    stop,
    next,
    prev,
    seek,
    playSong
  }
}

'use client'

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

export function useAudioPlayer(songs: PlayerSong[], initialSongId: string): AudioPlayerState & AudioPlayerActions {
  const poolRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const activeRef = useRef<HTMLAudioElement | null>(null)
  const [currentSongId, setCurrentSongId] = useState(initialSongId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStopped, setIsStopped] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [duration, setDuration] = useState(0)

  const sortedSongsRef = useRef<PlayerSong[]>([])
  sortedSongsRef.current = [...songs].sort((a, b) => {
    if (a.side !== b.side) return a.side === 'A' ? -1 : 1
    return a.position - b.position
  })

  const currentSong = songs.find(s => s.id === currentSongId)
  const currentSide = currentSong?.side ?? 'A'
  const progress = duration > 0 ? elapsedSeconds / duration : 0

  /** Get or create an Audio element for a song */
  const getAudio = useCallback((song: PlayerSong): HTMLAudioElement => {
    const pool = poolRef.current
    let audio = pool.get(song.id)
    if (!audio) {
      audio = new Audio()
      audio.preload = 'auto'
      audio.src = song.audioSrc
      pool.set(song.id, audio)
    }
    return audio
  }, [])

  // Build pool for all songs on mount (staggered, non-blocking)
  useEffect(() => {
    const sorted = sortedSongsRef.current
    if (sorted.length === 0) return

    let i = 0
    // Create one Audio element every 200ms to avoid hammering the network
    const interval = setInterval(() => {
      if (i >= sorted.length) {
        clearInterval(interval)
        return
      }
      getAudio(sorted[i])
      i++
    }, 200)

    return () => clearInterval(interval)
  }, [songs, getAudio])

  // Wire up the active audio element when currentSongId changes
  useEffect(() => {
    if (!currentSong) return

    // Detach old listeners
    const prev = activeRef.current
    if (prev) {
      prev.pause()
      prev.removeEventListener('timeupdate', onTimeUpdate)
      prev.removeEventListener('durationchange', onDurationChange)
      prev.removeEventListener('ended', onEnded)
      prev.removeEventListener('play', onPlay)
      prev.removeEventListener('pause', onPause)
    }

    const audio = getAudio(currentSong)
    activeRef.current = audio

    // Attach listeners
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    // Sync state
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
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongId)
    if (idx < sorted.length - 1) {
      setCurrentSongId(sorted[idx + 1].id)
      setTimeout(() => activeRef.current?.play().catch(() => {}), 0)
    } else {
      setCurrentSongId(sorted[0].id)
      setIsPlaying(false)
    }
  }
  function onPlay() {
    setIsPlaying(true)
    // Update OS-level UI immediately — don't wait for React's effect cycle.
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing'
    }
  }
  function onPause() {
    // iOS fires a spurious pause when locking the screen — ignore it so the
    // lock screen keeps showing the play/pause button in the correct state.
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
    setIsPlaying(false)
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused'
    }
  }

  // Cleanup pool on unmount
  useEffect(() => {
    return () => {
      poolRef.current.forEach(audio => {
        audio.pause()
        audio.src = ''
      })
      poolRef.current.clear()
    }
  }, [])

  // iOS fires a spurious 'pause' event when locking the screen even if audio
  // continues. Re-sync playbackState from the audio element's actual state
  // when the page becomes visible again (user unlocks).
  useEffect(() => {
    if (typeof document === 'undefined' || !('mediaSession' in navigator)) return
    const sync = () => {
      const audio = activeRef.current
      if (!audio) return
      navigator.mediaSession.playbackState = audio.paused ? 'paused' : 'playing'
    }
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  // ── MediaSession: lock screen / notification / car / Bluetooth controls ──
  // Sets the now-playing metadata (title, artist, artwork) and action handlers
  // so the OS-level media controls work and show the Ruidozo branding.
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
    if (!currentSong) return

    const artworkUrl = `${window.location.origin}/assets/media-artwork.png?v=2`
    navigator.mediaSession.metadata = new MediaMetadata({
      // Line 1 on the lock screen: "Canción - Autor"
      title: `${currentSong.title} - ${currentSong.artist}`,
      // Line 2 on the lock screen: brand
      artist: 'Ruidozo MX',
      album: 'Cassette semanal',
      artwork: [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }]
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
    // Set eagerly before the audio element fires its 'play' event — iOS reads
    // playbackState as soon as the lock screen appears, before React can react.
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing'
    }
    activeRef.current?.play().catch(() => {})
  }, [])

  const pause = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused'
    }
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
      const nextSong = sorted[idx + 1]
      const current = activeRef.current
      if (current) {
        current.pause()
        current.currentTime = 0
      }
      setIsStopped(false)
      setCurrentSongId(nextSong.id)
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
      const audio = getAudio(nextSong)
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  }, [currentSongId, getAudio])

  const prev = useCallback(() => {
    const audio = activeRef.current
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongId)

    // Standard behaviour: if more than 3 s in, restart current song
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setElapsedSeconds(0)
      return
    }

    // Otherwise go to previous song
    if (idx > 0) {
      const prevSong = sorted[idx - 1]
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      setIsStopped(false)
      setCurrentSongId(prevSong.id)
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
      const prevAudio = getAudio(prevSong)
      prevAudio.currentTime = 0
      prevAudio.play().catch(() => {})
    }
  }, [currentSongId, getAudio])

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

    return () => {
      ;(['play', 'pause', 'previoustrack', 'nexttrack', 'stop', 'seekto'] as MediaSessionAction[]).forEach(a =>
        setHandler(a, null)
      )
    }
  }, [play, pause, next, prev, stop])

  // Keep MediaSession position state up-to-date so scrubbers in the OS UI work
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('mediaSession' in navigator) ||
      !('setPositionState' in navigator.mediaSession)
    )
      return
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
      // Stop current
      const current = activeRef.current
      if (current) {
        current.pause()
        current.currentTime = 0
      }

      setIsStopped(false)
      setCurrentSongId(id)
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }

      // Play from pool immediately — the Audio element may already be buffered
      const song = songs.find(s => s.id === id)
      if (song) {
        const audio = getAudio(song)
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
    },
    [songs, getAudio]
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

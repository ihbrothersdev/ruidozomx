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
  function onPlay() { setIsPlaying(true) }
  function onPause() { setIsPlaying(false) }

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

  const play = useCallback(() => {
    setIsStopped(false)
    activeRef.current?.play().catch(() => {})
  }, [])

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
    if (idx < sorted.length - 1) setCurrentSongId(sorted[idx + 1].id)
  }, [currentSongId])

  const prev = useCallback(() => {
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongId)
    if (idx > 0) setCurrentSongId(sorted[idx - 1].id)
  }, [currentSongId])

  const seek = useCallback((pct: number) => {
    const audio = activeRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = pct * audio.duration
  }, [])

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

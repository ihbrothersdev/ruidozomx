'use client'

import type { PlayerSong } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'

interface AudioPlayerState {
  isPlaying: boolean
  currentSongId: string
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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentSongId, setCurrentSongId] = useState(initialSongId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStopped, setIsStopped] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [duration, setDuration] = useState(0)

  const currentSong = songs.find(s => s.id === currentSongId)
  const currentSide = currentSong?.side ?? 'A'
  const progress = duration > 0 ? elapsedSeconds / duration : 0

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Load song when currentSongId changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    const wasPlaying = isPlaying
    audio.src = currentSong.audioSrc
    audio.load()

    if (wasPlaying) {
      audio.play().catch(() => {})
    }
  }, [currentSongId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Attach event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setElapsedSeconds(Math.floor(audio.currentTime))
    }

    const onDurationChange = () => {
      setDuration(Math.floor(audio.duration) || 0)
    }

    const onEnded = () => {
      // Auto-advance to next song
      const sortedSongs = [...songs].sort((a, b) => {
        if (a.side !== b.side) return a.side === 'A' ? -1 : 1
        return a.position - b.position
      })
      const currentIndex = sortedSongs.findIndex(s => s.id === currentSongId)
      if (currentIndex < sortedSongs.length - 1) {
        setCurrentSongId(sortedSongs[currentIndex + 1].id)
      } else {
        // Wrap to first song
        setCurrentSongId(sortedSongs[0].id)
        setIsPlaying(false)
      }
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [songs, currentSongId])

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {})
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setElapsedSeconds(0)
    setIsStopped(true)
  }, [])

  const next = useCallback(() => {
    const sortedSongs = [...songs].sort((a, b) => {
      if (a.side !== b.side) return a.side === 'A' ? -1 : 1
      return a.position - b.position
    })
    const currentIndex = sortedSongs.findIndex(s => s.id === currentSongId)
    if (currentIndex < sortedSongs.length - 1) {
      setCurrentSongId(sortedSongs[currentIndex + 1].id)
    }
  }, [songs, currentSongId])

  const prev = useCallback(() => {
    const sortedSongs = [...songs].sort((a, b) => {
      if (a.side !== b.side) return a.side === 'A' ? -1 : 1
      return a.position - b.position
    })
    const currentIndex = sortedSongs.findIndex(s => s.id === currentSongId)
    if (currentIndex > 0) {
      setCurrentSongId(sortedSongs[currentIndex - 1].id)
    }
  }, [songs, currentSongId])

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = pct * audio.duration
  }, [])

  const playSong = useCallback((id: string) => {
    setCurrentSongId(id)
    // Will auto-play via the useEffect that watches currentSongId
    setTimeout(() => {
      audioRef.current?.play().catch(() => {})
    }, 100)
  }, [])

  return {
    isPlaying,
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

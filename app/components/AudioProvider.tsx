'use client'

import { useAudioStore } from '@/lib/store/audio-store'
import type { PlayerSong } from '@/lib/types'
import { useEffect } from 'react'

interface AudioProviderProps {
  children: React.ReactNode
  initialSongs: PlayerSong[]
  initialSongId?: string
}

export function AudioProvider({ children, initialSongs, initialSongId }: AudioProviderProps) {
  const loadSongs = useAudioStore(s => s.loadSongs)

  useEffect(() => {
    if (initialSongs.length === 0) return
    loadSongs(initialSongs, initialSongId ?? initialSongs[0].id)
  }, [loadSongs, initialSongs, initialSongId])

  return <>{children}</>
}

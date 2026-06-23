'use client'

import { useAudioStore } from '@/lib/store/audio-store'
import type { PlayerSong } from '@/lib/types'
import { useEffect } from 'react'

interface AudioProviderProps {
  children: React.ReactNode
  /** The live cassette — the global default the persistent bar plays everywhere. */
  songs: PlayerSong[]
  cassetteId: string | null
  concatAudioUrl: string | null
}

export function AudioProvider({ children, songs, cassetteId, concatAudioUrl }: AudioProviderProps) {
  const loadCassette = useAudioStore(s => s.loadCassette)

  useEffect(() => {
    if (songs.length === 0) return
    // Idempotent — `loadCassette` no-ops when this cassette is already loaded,
    // so it won't interrupt playback on navigation.
    loadCassette({ songs, cassetteId, concatAudioUrl, cassetteActive: true })
  }, [loadCassette, songs, cassetteId, concatAudioUrl])

  return <>{children}</>
}

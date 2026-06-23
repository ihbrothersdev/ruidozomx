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
  const loadContext = useAudioStore(s => s.loadContext)

  useEffect(() => {
    if (songs.length === 0) return
    // Idempotent — `loadContext` no-ops when this source is already loaded, so
    // it won't interrupt playback on navigation (including a profile rola that
    // took over the player).
    loadContext({
      contextId: `cassette:${cassetteId ?? 'active'}`,
      songs,
      cassetteId,
      concatAudioUrl,
      cassetteActive: true
    })
  }, [loadContext, songs, cassetteId, concatAudioUrl])

  return <>{children}</>
}

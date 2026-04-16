'use client'

import { useEffect } from 'react'
import { useAudioStore } from '@/lib/store/audio-store'
import { MOCK_SONGS } from '@/lib/mock-data'

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const loadSongs = useAudioStore(s => s.loadSongs)

  useEffect(() => {
    loadSongs(MOCK_SONGS, 'a01')
  }, [loadSongs])

  return <>{children}</>
}

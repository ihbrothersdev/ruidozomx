'use client'

import { useAudioStore } from '@/lib/store/audio-store'
import { useShallow } from 'zustand/shallow'

export { useAudioStore }

export function usePlayerState() {
  return useAudioStore(
    useShallow(s => ({
      isPlaying: s.isPlaying,
      isStopped: s.isStopped,
      currentSongId: s.currentSongId,
      currentSide: s.currentSide,
      elapsedSeconds: s.elapsedSeconds,
      duration: s.duration,
      progress: s.progress
    }))
  )
}

export function usePlayerActions() {
  return useAudioStore(
    useShallow(s => ({
      play: s.play,
      pause: s.pause,
      stop: s.stop,
      next: s.next,
      prev: s.prev,
      seek: s.seek,
      playSong: s.playSong,
      setVolume: s.setVolume,
      toggleMute: s.toggleMute
    }))
  )
}

export function usePlayerSongs() {
  return useAudioStore(s => s.songs)
}

export function useCurrentSong() {
  return useAudioStore(s => s.songs.find(song => song.id === s.currentSongId) ?? null)
}

export function usePlayerVolume() {
  return useAudioStore(
    useShallow(s => ({
      volume: s.volume,
      isMuted: s.isMuted
    }))
  )
}

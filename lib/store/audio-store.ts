import { create } from 'zustand'
import type { PlayerSong } from '@/lib/types'

// ── Audio singleton (lives outside React) ────────────────────────────
let audio: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement {
  if (!audio && typeof window !== 'undefined') {
    audio = new Audio()
  }
  return audio!
}

// ── Helpers ──────────────────────────────────────────────────────────
function getSortedSongs(songs: PlayerSong[]) {
  return [...songs].sort((a, b) => {
    if (a.side !== b.side) return a.side === 'A' ? -1 : 1
    return a.position - b.position
  })
}

// ── Store types ─────────────────────────────────────────────────────
interface AudioStore {
  // Song data
  songs: PlayerSong[]

  // Playback state
  currentSongId: string | null
  isPlaying: boolean
  isStopped: boolean
  currentSide: 'A' | 'B'
  elapsedSeconds: number
  duration: number
  progress: number

  // Volume
  volume: number
  isMuted: boolean

  // Actions
  loadSongs: (songs: PlayerSong[], initialSongId?: string) => void
  play: () => void
  pause: () => void
  stop: () => void
  next: () => void
  prev: () => void
  seek: (progress: number) => void
  playSong: (id: string) => void
  setVolume: (vol: number) => void
  toggleMute: () => void
}

// ── Store ───────────────────────────────────────────────────────────
export const useAudioStore = create<AudioStore>((set, get) => ({
  songs: [],
  currentSongId: null,
  isPlaying: false,
  isStopped: false,
  currentSide: 'A',
  elapsedSeconds: 0,
  duration: 0,
  progress: 0,
  volume: 1,
  isMuted: false,

  loadSongs: (songs, initialSongId) => {
    // Idempotent — don't re-init if already loaded (StrictMode double-mount)
    if (get().songs.length > 0) return

    const el = getAudio()

    // Wire event listeners once
    el.addEventListener('timeupdate', () => {
      const secs = Math.floor(el.currentTime)
      const dur = Math.floor(el.duration) || 0
      set({
        elapsedSeconds: secs,
        duration: dur,
        progress: dur > 0 ? secs / dur : 0
      })
    })

    el.addEventListener('durationchange', () => {
      set({ duration: Math.floor(el.duration) || 0 })
    })

    el.addEventListener('ended', () => {
      const { songs, currentSongId } = get()
      const sorted = getSortedSongs(songs)
      const idx = sorted.findIndex(s => s.id === currentSongId)
      if (idx < sorted.length - 1) {
        get().playSong(sorted[idx + 1].id)
      } else {
        // Wrap to first song, stop playing
        const first = sorted[0]
        set({
          currentSongId: first.id,
          currentSide: first.side,
          isPlaying: false,
          isStopped: false,
          elapsedSeconds: 0,
          progress: 0
        })
        el.src = first.audioSrc
        el.load()
      }
    })

    el.addEventListener('play', () => set({ isPlaying: true }))
    el.addEventListener('pause', () => set({ isPlaying: false }))

    // Set initial state
    const song = songs.find(s => s.id === initialSongId) ?? songs[0]
    if (song) {
      el.src = song.audioSrc
      el.load()
      set({
        songs,
        currentSongId: song.id,
        currentSide: song.side
      })
    } else {
      set({ songs })
    }
  },

  play: () => {
    set({ isStopped: false })
    getAudio()
      .play()
      .catch(() => {})
  },

  pause: () => {
    getAudio().pause()
  },

  stop: () => {
    const el = getAudio()
    el.pause()
    el.currentTime = 0
    set({ isStopped: true, elapsedSeconds: 0, progress: 0 })
  },

  next: () => {
    const { songs, currentSongId } = get()
    const sorted = getSortedSongs(songs)
    const idx = sorted.findIndex(s => s.id === currentSongId)
    if (idx < sorted.length - 1) {
      get().playSong(sorted[idx + 1].id)
    }
  },

  prev: () => {
    const { songs, currentSongId } = get()
    const sorted = getSortedSongs(songs)
    const idx = sorted.findIndex(s => s.id === currentSongId)
    if (idx > 0) {
      get().playSong(sorted[idx - 1].id)
    }
  },

  seek: pct => {
    const el = getAudio()
    if (!el.duration) return
    el.currentTime = pct * el.duration
  },

  playSong: id => {
    const { songs, isPlaying } = get()
    const song = songs.find(s => s.id === id)
    if (!song) return

    const el = getAudio()
    el.src = song.audioSrc
    el.load()
    set({
      currentSongId: id,
      currentSide: song.side,
      isStopped: false,
      elapsedSeconds: 0,
      progress: 0
    })

    // Auto-play if was playing, or always play on explicit song selection
    if (isPlaying || true) {
      el.play().catch(() => {})
    }
  },

  setVolume: vol => {
    const el = getAudio()
    el.volume = vol
    // Auto-unmute when user adjusts the volume slider
    if (el.muted) {
      el.muted = false
    }
    set({ volume: vol, isMuted: false })
  },

  toggleMute: () => {
    const el = getAudio()
    el.muted = !el.muted
    set({ isMuted: el.muted })
  }
}))

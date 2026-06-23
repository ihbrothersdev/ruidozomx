import { logEvent, type SongEventType } from '@/app/analytics/actions'
import { getAnonSessionId } from '@/lib/analytics/session'
import type { PlayerSong } from '@/lib/types'
import { create } from 'zustand'

/**
 * Global cassette player engine.
 *
 * A single `<audio>` element + all playback logic live OUTSIDE React as a
 * module singleton, exposed through a Zustand store. This is what lets the
 * music keep playing while the user navigates between pages (the engine and
 * the PersistentPlayerBar live in the root layout, not in any page).
 *
 * This is the former `useAudioPlayer` hook lifted into a singleton — concat
 * mode, per-song analytics, MediaSession (lock-screen / Bluetooth / car) and
 * the iOS pause quirks are all preserved.
 */

export interface PlaybackContext {
  /** Stable id for the source playlist: `cassette:<id>` or `profile:<id>`. */
  contextId: string
  songs: PlayerSong[]
  /** Cassette id for analytics; null for non-cassette sources (no analytics). */
  cassetteId: string | null
  concatAudioUrl: string | null
  /** Whether this is the live cassette (vs an archived/searched one). */
  cassetteActive: boolean
  /** Song to open on; falls back to the first song. */
  initialSongId?: string
  /** Start playing as soon as the playlist loads (archived/search/profile deep-links). */
  autoPlay?: boolean
  /** Loop the playlist: last → first (and next/prev wrap around). */
  loop?: boolean
  /**
   * Only load when nothing is playing yet (the global default). The layout's
   * AudioProvider sets the live cassette this way so a server re-render
   * (revalidate/refresh) never clobbers a profile rola that took over.
   */
  onlyIfEmpty?: boolean
}

// ── Engine singletons (live outside React) ───────────────────────────────────
let audioEl: HTMLAudioElement | null = null
let engineInited = false
// The most recent pause initiated by us (UI/OS control). iOS fires spurious
// 'pause' events on lock-screen even while audio keeps playing; we ignore those.
let userPaused = false
let sessionId = ''
let sessionStarted = false
let playStartLoggedFor: string | null = null
const completedSongs = new Set<string>()

function getSorted(songs: PlayerSong[]): PlayerSong[] {
  return [...songs].sort((a, b) => {
    if (a.side !== b.side) return a.side === 'A' ? -1 : 1
    return a.position - b.position
  })
}

interface AudioStore {
  // Playback context
  contextId: string | null
  songs: PlayerSong[]
  cassetteId: string | null
  concatAudioUrl: string | null
  cassetteActive: boolean
  loop: boolean

  // Playback state
  currentSongId: string | null
  isPlaying: boolean
  isStopped: boolean
  elapsedSeconds: number
  duration: number

  // Volume
  volume: number
  isMuted: boolean

  // Actions
  loadContext: (ctx: PlaybackContext) => void
  play: () => void
  pause: () => void
  stop: () => void
  next: () => void
  prev: () => void
  seek: (pct: number) => void
  playSong: (id: string) => void
  setVolume: (vol: number) => void
  toggleMute: () => void
}

export const useAudioStore = create<AudioStore>((set, get) => {
  // ── Internal helpers (closure over set/get) ───────────────────────────────
  const concatMode = () => {
    const { concatAudioUrl, songs } = get()
    return (
      !!concatAudioUrl &&
      songs.length > 0 &&
      songs.every(s => s.startSeconds !== undefined && s.endSeconds !== undefined)
    )
  }

  const emit = (type: SongEventType, songId: string | null, metadata?: Record<string, unknown>) => {
    // Analytics are cassette-scoped. Non-cassette sources (profile playlists)
    // carry no cassetteId, so they don't emit listening events.
    const cid = get().cassetteId
    if (!cid) return
    void logEvent({ type, songId, cassetteId: cid, sessionId: sessionId || null, metadata }).catch(() => {})
  }

  const updateMediaMetadata = () => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return
    const { songs, currentSongId } = get()
    const song = songs.find(s => s.id === currentSongId)
    if (!song) return
    const artworkUrl = `${window.location.origin}/assets/media-artwork.png?v=2`
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${song.title} - ${song.artist}`,
      artist: 'Ruidozo MX',
      album: 'Cassette semanal',
      artwork: [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }]
    })
  }

  const setCurrentSong = (id: string) => {
    // Reset the play_start dedup flag so re-entering a song logs a fresh event.
    if (get().currentSongId !== id) playStartLoggedFor = null
    const patch: Partial<AudioStore> = { currentSongId: id }
    // In concat mode the audio element's duration is the whole cassette, so the
    // per-song duration the UI shows must come from the song's offsets.
    if (concatMode()) {
      const song = get().songs.find(s => s.id === id)
      if (song?.startSeconds !== undefined && song?.endSeconds !== undefined) {
        patch.duration = Math.max(0, Math.floor(song.endSeconds - song.startSeconds))
      }
    }
    set(patch)
    updateMediaMetadata()
  }

  const getAudio = (): HTMLAudioElement => audioEl!

  const initEngine = () => {
    if (engineInited || typeof window === 'undefined') return
    engineInited = true

    sessionId = getAnonSessionId()

    const audio = document.createElement('audio')
    audio.preload = 'auto'
    audio.setAttribute('playsinline', '')
    audio.setAttribute('webkit-playsinline', '')
    audio.style.display = 'none'
    audio.volume = get().volume
    document.body.appendChild(audio)
    audioEl = audio

    audio.addEventListener('timeupdate', () => {
      const t = audio.currentTime
      if (concatMode()) {
        const sorted = getSorted(get().songs)
        const detected = sorted.find(
          s => s.startSeconds !== undefined && s.endSeconds !== undefined && t >= s.startSeconds && t < s.endSeconds
        )
        const curId = get().currentSongId
        const cur = detected ?? sorted.find(s => s.id === curId) ?? sorted[0]
        if (detected && detected.id !== curId) {
          // Organic boundary crossing — emit completion for the song we left.
          if (curId && !completedSongs.has(curId)) {
            completedSongs.add(curId)
            const prevSong = sorted.find(s => s.id === curId)
            const durListened =
              prevSong && prevSong.startSeconds !== undefined && prevSong.endSeconds !== undefined
                ? Math.round(prevSong.endSeconds - prevSong.startSeconds)
                : Math.round(audio.duration || 0)
            emit('play_complete', curId, { duration_listened: durListened })
          }
          setCurrentSong(detected.id)
        }
        const start = cur?.startSeconds ?? 0
        set({ elapsedSeconds: Math.max(0, Math.floor(t - start)) })
      } else {
        set({ elapsedSeconds: Math.floor(t) })
      }
    })

    audio.addEventListener('durationchange', () => {
      if (concatMode()) return // per-song duration is set from offsets elsewhere
      set({ duration: Math.floor(audio.duration) || 0 })
    })

    audio.addEventListener('ended', () => {
      const sorted = getSorted(get().songs)
      const endedId = get().currentSongId
      if (endedId && !completedSongs.has(endedId)) {
        completedSongs.add(endedId)
        emit('play_complete', endedId, { duration_listened: Math.round(audio.duration || 0) })
      }
      if (concatMode()) {
        const first = sorted[0]
        if (!first) return
        setCurrentSong(first.id)
        if (first.startSeconds !== undefined) audio.currentTime = first.startSeconds
        set({ isPlaying: false })
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
        return
      }
      const idx = sorted.findIndex(s => s.id === endedId)
      if (idx < sorted.length - 1) {
        const nextSong = sorted[idx + 1]
        setCurrentSong(nextSong.id)
        audio.src = nextSong.audioSrc
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        const first = sorted[0]
        if (!first) return
        setCurrentSong(first.id)
        audio.src = first.audioSrc
        audio.currentTime = 0
        if (get().loop) {
          // Circular playlist (profile rolas): wrap to the first and keep going.
          audio.play().catch(() => {})
        } else {
          set({ isPlaying: false })
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
        }
      }
    })

    audio.addEventListener('play', () => {
      userPaused = false
      set({ isPlaying: true })
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
      if (!sessionStarted) {
        sessionStarted = true
        emit('cassette_session_start', null, { initial_song_id: get().currentSongId })
      }
      const sid = get().currentSongId
      if (sid && playStartLoggedFor !== sid) {
        playStartLoggedFor = sid
        const song = getSorted(get().songs).find(s => s.id === sid)
        emit('play_start', sid, { side: song?.side, position: song?.position })
      }
    })

    audio.addEventListener('pause', () => {
      // Ignore iOS's spurious lock-screen pauses; only honour our own.
      if (!userPaused) {
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
        return
      }
      userPaused = false
      set({ isPlaying: false })
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
    })

    // Position state for OS scrubbers.
    audio.addEventListener('timeupdate', () => {
      if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return
      const { duration, elapsedSeconds } = get()
      if (!duration) return
      try {
        navigator.mediaSession.setPositionState({
          duration,
          position: Math.min(elapsedSeconds, duration),
          playbackRate: audio.playbackRate || 1
        })
      } catch {
        // Inconsistent values — ignore.
      }
    })

    // OS-level transport controls.
    if ('mediaSession' in navigator) {
      const setHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler)
        } catch {
          // Unsupported action — ignore.
        }
      }
      setHandler('play', () => get().play())
      setHandler('pause', () => get().pause())
      setHandler('previoustrack', () => get().prev())
      setHandler('nexttrack', () => get().next())
      setHandler('stop', () => get().stop())
      setHandler('seekto', details => {
        if (details.seekTime == null) return
        if (concatMode()) {
          const cur = getSorted(get().songs).find(s => s.id === get().currentSongId)
          audio.currentTime = (cur?.startSeconds ?? 0) + details.seekTime
          return
        }
        audio.currentTime = details.seekTime
      })
    }

    // Re-sync the lock-screen icon only when the page becomes visible again.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible' || !('mediaSession' in navigator)) return
      navigator.mediaSession.playbackState = audio.paused ? 'paused' : 'playing'
    })

    window.addEventListener('beforeunload', () => {
      if (sessionStarted) {
        emit('cassette_session_end', null, {
          last_song_id: get().currentSongId,
          elapsed_seconds: Math.round(audio.currentTime || 0)
        })
        sessionStarted = false
      }
    })
  }

  return {
    contextId: null,
    songs: [],
    cassetteId: null,
    concatAudioUrl: null,
    cassetteActive: true,
    loop: false,
    currentSongId: null,
    isPlaying: false,
    isStopped: false,
    elapsedSeconds: 0,
    duration: 0,
    volume: 1,
    isMuted: false,

    loadContext: ctx => {
      initEngine()
      const audio = getAudio()
      if (!audio || ctx.songs.length === 0) return

      const state = get()
      // The global default (layout) only seeds the player when empty — it must
      // never override an already-loaded source (e.g. a profile rola) on a
      // server re-render.
      if (ctx.onlyIfEmpty && state.songs.length > 0) return
      // Idempotent: re-loading the same source (e.g. the layout's active-cassette
      // init firing on every navigation) must not interrupt playback.
      if (state.songs.length > 0 && state.contextId === ctx.contextId) return

      // Preserve the play/pause state across a context swap: if the user was
      // listening (e.g. a profile rola) and lands on a new source, keep it
      // playing; if paused/idle (fresh page load), stay paused. `autoPlay`
      // forces playback for deep-links.
      const wasPlaying = !audio.paused
      const willPlay = !!ctx.autoPlay || wasPlaying

      completedSongs.clear()
      playStartLoggedFor = null

      const sorted = getSorted(ctx.songs)
      const initial = sorted.find(s => s.id === ctx.initialSongId) ?? sorted[0]
      const isConcat =
        !!ctx.concatAudioUrl && ctx.songs.every(s => s.startSeconds !== undefined && s.endSeconds !== undefined)

      set({
        contextId: ctx.contextId,
        songs: ctx.songs,
        cassetteId: ctx.cassetteId,
        concatAudioUrl: ctx.concatAudioUrl,
        cassetteActive: ctx.cassetteActive,
        loop: !!ctx.loop,
        currentSongId: initial?.id ?? null,
        isStopped: false,
        isPlaying: willPlay,
        elapsedSeconds: 0,
        duration:
          isConcat && initial?.startSeconds !== undefined && initial?.endSeconds !== undefined
            ? Math.max(0, Math.floor(initial.endSeconds - initial.startSeconds))
            : 0
      })
      updateMediaMetadata()

      // Mark this as a deliberate pause so the 'pause' listener honours it
      // (otherwise it's treated as an iOS spurious pause and `isPlaying` would
      // stay true, leaving the bar showing "playing" while frozen).
      userPaused = true
      audio.pause()
      if (isConcat && ctx.concatAudioUrl) {
        audio.src = ctx.concatAudioUrl
        if (initial?.startSeconds !== undefined) {
          const onLoaded = () => {
            if (initial.startSeconds !== undefined) audio.currentTime = initial.startSeconds
          }
          audio.addEventListener('loadedmetadata', onLoaded, { once: true })
        }
      } else if (initial) {
        audio.src = initial.audioSrc
        audio.currentTime = 0
      }

      if (willPlay) audio.play().catch(() => {})
    },

    play: () => {
      userPaused = false
      set({ isStopped: false })
      getAudio()
        ?.play()
        .catch(() => {})
    },

    pause: () => {
      userPaused = true
      getAudio()?.pause()
    },

    stop: () => {
      const audio = getAudio()
      if (!audio) return
      userPaused = true
      audio.pause()
      audio.currentTime = 0
      set({ elapsedSeconds: 0, isStopped: true })
    },

    next: () => {
      const audio = getAudio()
      if (!audio) return
      const sorted = getSorted(get().songs)
      const idx = sorted.findIndex(s => s.id === get().currentSongId)
      if (idx < 0) return
      const atEnd = idx >= sorted.length - 1
      if (atEnd && !get().loop) return
      const nextSong = atEnd ? sorted[0] : sorted[idx + 1]
      set({ isStopped: false })
      setCurrentSong(nextSong.id)
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
      if (concatMode() && nextSong.startSeconds !== undefined) {
        audio.currentTime = nextSong.startSeconds
        if (audio.paused) audio.play().catch(() => {})
        return
      }
      audio.src = nextSong.audioSrc
      audio.currentTime = 0
      audio.play().catch(() => {})
    },

    prev: () => {
      const audio = getAudio()
      if (!audio) return
      const sorted = getSorted(get().songs)
      const idx = sorted.findIndex(s => s.id === get().currentSongId)
      const cur = idx >= 0 ? sorted[idx] : undefined

      // >3s in restarts the song; otherwise step back.
      const intoSong =
        concatMode() && cur?.startSeconds !== undefined ? audio.currentTime - cur.startSeconds : audio.currentTime
      if (intoSong > 3) {
        audio.currentTime = concatMode() && cur?.startSeconds !== undefined ? cur.startSeconds : 0
        set({ elapsedSeconds: 0 })
        return
      }

      if (idx < 0) return
      const atStart = idx === 0
      if (atStart && !get().loop) return
      const prevSong = atStart ? sorted[sorted.length - 1] : sorted[idx - 1]
      set({ isStopped: false })
      setCurrentSong(prevSong.id)
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
      if (concatMode() && prevSong.startSeconds !== undefined) {
        audio.currentTime = prevSong.startSeconds
        if (audio.paused) audio.play().catch(() => {})
        return
      }
      audio.src = prevSong.audioSrc
      audio.currentTime = 0
      audio.play().catch(() => {})
    },

    seek: pct => {
      const audio = getAudio()
      if (!audio) return
      if (concatMode()) {
        const cur = getSorted(get().songs).find(s => s.id === get().currentSongId)
        if (!cur || cur.startSeconds === undefined || cur.endSeconds === undefined) return
        const songDur = cur.endSeconds - cur.startSeconds
        if (songDur <= 0) return
        audio.currentTime = cur.startSeconds + pct * songDur
        return
      }
      if (!audio.duration) return
      audio.currentTime = pct * audio.duration
    },

    playSong: id => {
      const audio = getAudio()
      if (!audio) return
      const song = get().songs.find(s => s.id === id)
      if (!song) return
      set({ isStopped: false })
      setCurrentSong(id)
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
      if (concatMode() && song.startSeconds !== undefined) {
        audio.currentTime = song.startSeconds
        audio.play().catch(() => {})
        return
      }
      audio.src = song.audioSrc
      audio.currentTime = 0
      audio.play().catch(() => {})
    },

    setVolume: vol => {
      const audio = getAudio()
      if (audio) {
        audio.volume = vol
        if (audio.muted) audio.muted = false
      }
      set({ volume: vol, isMuted: false })
    },

    toggleMute: () => {
      const audio = getAudio()
      if (!audio) return
      audio.muted = !audio.muted
      set({ isMuted: audio.muted })
    }
  }
})

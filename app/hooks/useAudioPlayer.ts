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

export function useAudioPlayer(
  songs: PlayerSong[],
  initialSongId: string,
  concatAudioUrl?: string | null
): AudioPlayerState & AudioPlayerActions {
  // Single <audio> element shared across all tracks. iOS only grants the
  // "user-activated" autoplay permission to the specific element the user
  // gestured on; a pool of one-per-song elements means chained playback from
  // 'ended' is blocked for every track after the first. Swapping `.src` on a
  // single element keeps the unlock and avoids that block.
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Tracks whether the most recent pause was initiated by the user (UI button
  // or OS media control). iOS fires a spurious 'pause' on lock-screen even
  // though audio keeps playing; we use this flag to ignore those.
  const userPausedRef = useRef(false)
  const [currentSongId, setCurrentSongId] = useState(initialSongId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStopped, setIsStopped] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [duration, setDuration] = useState(0)

  // Concat mode: when the cassette has been processed by `npm run
  // build-cassette`, the player streams ONE continuous file and navigates
  // between songs via `currentTime` instead of swapping `audio.src`. This
  // survives Android's background tab freeze because the browser doesn't
  // need JS to advance between songs — they're all the same audio element,
  // just different timestamps. Requires every song to carry start/end
  // offsets; otherwise we fall back to the legacy per-song-URL mode.
  const concatMode =
    !!concatAudioUrl && songs.length > 0 && songs.every(s => s.startSeconds !== undefined && s.endSeconds !== undefined)
  const concatModeRef = useRef(concatMode)
  concatModeRef.current = concatMode
  const concatAudioUrlRef = useRef<string | null | undefined>(concatAudioUrl)
  concatAudioUrlRef.current = concatAudioUrl

  const sortedSongsRef = useRef<PlayerSong[]>([])
  sortedSongsRef.current = [...songs].sort((a, b) => {
    if (a.side !== b.side) return a.side === 'A' ? -1 : 1
    return a.position - b.position
  })

  // Mirror currentSongId in a ref so the mount-time listeners (attached once)
  // always see the latest value without re-attaching.
  const currentSongIdRef = useRef(currentSongId)
  useEffect(() => {
    currentSongIdRef.current = currentSongId
  }, [currentSongId])

  const currentSong = songs.find(s => s.id === currentSongId)
  const currentSide = currentSong?.side ?? 'A'
  const progress = duration > 0 ? elapsedSeconds / duration : 0

  // Create the audio element once and attach all listeners once. Swapping
  // `.src` later is what advances tracks — the element itself never changes,
  // so there's no race between React's effect-driven ref swap and the
  // playback chain triggered from 'ended'.
  useEffect(() => {
    const audio = document.createElement('audio')
    audio.preload = 'auto'
    audio.setAttribute('playsinline', '')
    audio.setAttribute('webkit-playsinline', '')
    audio.style.display = 'none'
    document.body.appendChild(audio)
    audioRef.current = audio

    const onTimeUpdate = () => {
      const t = audio.currentTime
      if (concatModeRef.current) {
        // CONCAT MODE: audio.currentTime is absolute within the whole cassette.
        // Derive (a) which song the cursor is in, (b) the per-song elapsed
        // counter the UI shows. The browser keeps playing across boundaries
        // by itself — we're just keeping the label in sync.
        const sorted = sortedSongsRef.current
        const detected = sorted.find(
          s => s.startSeconds !== undefined && s.endSeconds !== undefined && t >= s.startSeconds && t < s.endSeconds
        )
        const cur = detected ?? sorted.find(s => s.id === currentSongIdRef.current) ?? sorted[0]
        if (detected && detected.id !== currentSongIdRef.current) {
          setCurrentSongId(detected.id)
        }
        const start = cur?.startSeconds ?? 0
        setElapsedSeconds(Math.max(0, Math.floor(t - start)))
      } else {
        setElapsedSeconds(Math.floor(t))
      }
    }
    const onDurationChange = () => {
      // In concat mode the audio element's own duration is the whole file,
      // which is meaningless for the UI; a separate effect sets `duration`
      // from the current song's offsets. Ignore the event here.
      if (concatModeRef.current) return
      setDuration(Math.floor(audio.duration) || 0)
    }
    const onEnded = () => {
      const sorted = sortedSongsRef.current
      if (concatModeRef.current) {
        // In concat mode, the only 'ended' is the end of the whole cassette
        // (song-to-song transitions are invisible to the browser). Wrap to
        // the first song and pause — same end-of-cassette UX as legacy.
        const first = sorted[0]
        setCurrentSongId(first.id)
        if (first.startSeconds !== undefined) audio.currentTime = first.startSeconds
        setIsPlaying(false)
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused'
        }
        return
      }
      const idx = sorted.findIndex(s => s.id === currentSongIdRef.current)
      if (idx < sorted.length - 1) {
        const nextSong = sorted[idx + 1]
        setCurrentSongId(nextSong.id)
        audio.src = nextSong.audioSrc
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        const first = sorted[0]
        setCurrentSongId(first.id)
        audio.src = first.audioSrc
        audio.currentTime = 0
        setIsPlaying(false)
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused'
        }
      }
    }
    const onPlay = () => {
      userPausedRef.current = false
      setIsPlaying(true)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
    }
    const onPause = () => {
      // iOS Safari/WebKit fires spurious 'pause' events while the screen is
      // locked even though audio keeps playing. Only honour pauses initiated
      // by us via the `pause()` callback (UI button or OS media control); all
      // other pause events are ignored and we re-assert 'playing' so the
      // lock-screen icon stays correct.
      if (!userPausedRef.current) {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing'
        }
        return
      }
      userPausedRef.current = false
      setIsPlaying(false)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused'
      }
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    // Preload the initial track so the first play() responds instantly to
    // the user's gesture (which is also what unlocks autoplay for the rest
    // of the session on iOS).
    const initial = sortedSongsRef.current.find(s => s.id === currentSongIdRef.current)
    if (concatModeRef.current && concatAudioUrlRef.current) {
      // Concat mode: one src for the whole cassette; seek to the initial
      // song's offset. After that, src never changes for this mount.
      audio.src = concatAudioUrlRef.current
      if (initial?.startSeconds !== undefined) {
        // Some browsers ignore currentTime sets before metadata loads; wait
        // for loadedmetadata then seek. We attach a one-shot listener.
        const onLoaded = () => {
          if (initial.startSeconds !== undefined) audio.currentTime = initial.startSeconds
        }
        audio.addEventListener('loadedmetadata', onLoaded, { once: true })
      }
    } else if (initial) {
      audio.src = initial.audioSrc
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.pause()
      audio.src = ''
      if (audio.parentNode) audio.parentNode.removeChild(audio)
      audioRef.current = null
    }
  }, [])

  // In concat mode, `durationchange` fires once for the entire cassette
  // file, which is useless for the per-song UI (the cassette label shows
  // 03:42 / 03:42, not 03:42 / 47:18). Drive `duration` from the current
  // song's offsets instead. In legacy mode this effect is a no-op — the
  // event-driven `setDuration` in onDurationChange owns the value.
  useEffect(() => {
    if (!concatMode || !currentSong) return
    if (currentSong.startSeconds === undefined || currentSong.endSeconds === undefined) return
    setDuration(Math.max(0, Math.floor(currentSong.endSeconds - currentSong.startSeconds)))
  }, [concatMode, currentSong])

  // Re-sync playbackState from the audio element's actual state ONLY when the
  // page becomes visible again (user unlocks). Syncing while the page is
  // hidden would let iOS's spurious 'pause' flip the lock-screen icon.
  useEffect(() => {
    if (typeof document === 'undefined' || !('mediaSession' in navigator)) return
    const sync = () => {
      if (document.visibilityState !== 'visible') return
      const audio = audioRef.current
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

  // NOTE: We intentionally do NOT mirror `isPlaying` -> `mediaSession.playbackState`
  // in an effect. The audio element's own 'play'/'pause' events drive the
  // MediaSession state via onPlay/onPause; layering a React-state-driven
  // sync on top creates races and lets a transient `isPlaying === false`
  // (e.g. while React processes a song change) flip the lock-screen icon
  // even though audio is still playing.

  const play = useCallback(() => {
    userPausedRef.current = false
    setIsStopped(false)
    // The audio element's 'play' event will set mediaSession to 'playing'
    // once playback actually starts. Avoid eager updates so we don't desync
    // from the underlying audio state on iOS.
    audioRef.current?.play().catch(() => {})
  }, [])

  const pause = useCallback(() => {
    userPausedRef.current = true
    // Don't eagerly set mediaSession='paused' or isPlaying=false here.
    // On iOS, audio.pause() may fail silently while the page is in the
    // background; if we eagerly mark paused, the lock-screen icon would
    // flip to "play" even though audio kept playing. Let the audio's own
    // 'pause' event drive the state update via onPause.
    audioRef.current?.pause()
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    userPausedRef.current = true
    audio.pause()
    audio.currentTime = 0
    setElapsedSeconds(0)
    setIsStopped(true)
  }, [])

  const next = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongIdRef.current)
    if (idx < 0 || idx >= sorted.length - 1) return
    const nextSong = sorted[idx + 1]
    setIsStopped(false)
    setCurrentSongId(nextSong.id)
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing'
    }
    if (concatModeRef.current && nextSong.startSeconds !== undefined) {
      // Concat mode: same audio element, just seek. No src swap, no play()
      // (we're already playing — or the user pressed next while paused,
      // in which case the seek alone is enough; play() below handles that).
      audio.currentTime = nextSong.startSeconds
      if (audio.paused) {
        audio.play().catch(() => {})
      }
      return
    }
    audio.src = nextSong.audioSrc
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  const prev = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongIdRef.current)

    // Standard behaviour: if more than 3 s into the current song, restart it.
    // In concat mode "current time" means time within the song, so compute it
    // relative to the song's start offset.
    const cur = idx >= 0 ? sorted[idx] : undefined
    const intoSong =
      concatModeRef.current && cur?.startSeconds !== undefined
        ? audio.currentTime - cur.startSeconds
        : audio.currentTime
    if (intoSong > 3) {
      if (concatModeRef.current && cur?.startSeconds !== undefined) {
        audio.currentTime = cur.startSeconds
      } else {
        audio.currentTime = 0
      }
      setElapsedSeconds(0)
      return
    }

    // Otherwise go to previous song
    if (idx <= 0) return
    const prevSong = sorted[idx - 1]
    setIsStopped(false)
    setCurrentSongId(prevSong.id)
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing'
    }
    if (concatModeRef.current && prevSong.startSeconds !== undefined) {
      audio.currentTime = prevSong.startSeconds
      if (audio.paused) {
        audio.play().catch(() => {})
      }
      return
    }
    audio.src = prevSong.audioSrc
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current
    if (!audio) return
    if (concatModeRef.current) {
      // In concat mode pct is relative to the CURRENT song, not the whole
      // file. Translate via the current song's offsets.
      const cur = sortedSongsRef.current.find(s => s.id === currentSongIdRef.current)
      if (!cur || cur.startSeconds === undefined || cur.endSeconds === undefined) return
      const songDur = cur.endSeconds - cur.startSeconds
      if (songDur <= 0) return
      audio.currentTime = cur.startSeconds + pct * songDur
      return
    }
    if (!audio.duration) return
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
      const audio = audioRef.current
      if (!audio || details.seekTime == null) return
      if (concatModeRef.current) {
        // OS seekbar reports the position relative to the CURRENT song
        // (we set positionState in song-local units). Translate to absolute
        // file time by adding the current song's start offset.
        const cur = sortedSongsRef.current.find(s => s.id === currentSongIdRef.current)
        const offset = cur?.startSeconds ?? 0
        audio.currentTime = offset + details.seekTime
        return
      }
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
        playbackRate: audioRef.current?.playbackRate ?? 1
      })
    } catch {
      // Some browsers throw if values are inconsistent — safe to ignore.
    }
  }, [elapsedSeconds, duration])

  const playSong = useCallback(
    (id: string) => {
      const audio = audioRef.current
      if (!audio) return
      const song = songs.find(s => s.id === id)
      if (!song) return

      setIsStopped(false)
      setCurrentSongId(id)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
      if (concatModeRef.current && song.startSeconds !== undefined) {
        // Concat mode: same element, just jump. Calling play() is still
        // needed because the user gesture (the click) is what unlocks
        // autoplay on first interaction.
        audio.currentTime = song.startSeconds
        audio.play().catch(() => {})
        return
      }
      audio.src = song.audioSrc
      audio.currentTime = 0
      audio.play().catch(() => {})
    },
    [songs]
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

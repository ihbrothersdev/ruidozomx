'use client'

import { logPlayerEvent, snapshotAudio } from '@/lib/player-debug'
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

  // Diagnostic logger — no-op unless the user has enabled it via
  // `?debug=player`. Reads only refs so the identity stays stable across
  // renders (safe to add to useEffect deps).
  const log = useCallback((eventType: string, payload?: Record<string, unknown>) => {
    const audio = audioRef.current
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongIdRef.current)
    logPlayerEvent({
      event_type: eventType,
      song_id: currentSongIdRef.current ?? null,
      song_index: idx >= 0 ? idx : null,
      ...snapshotAudio(audio),
      payload: payload ?? null
    })
  }, [])

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

    const onTimeUpdate = () => setElapsedSeconds(Math.floor(audio.currentTime))
    const onDurationChange = () => setDuration(Math.floor(audio.duration) || 0)
    const onEnded = () => {
      log('event_ended')
      const sorted = sortedSongsRef.current
      const idx = sorted.findIndex(s => s.id === currentSongIdRef.current)
      if (idx < sorted.length - 1) {
        const nextSong = sorted[idx + 1]
        log('advance_next', { to_song_id: nextSong.id, to_song_index: idx + 1 })
        setCurrentSongId(nextSong.id)
        audio.src = nextSong.audioSrc
        audio.currentTime = 0
        audio
          .play()
          .then(() => log('play_resolved', { from: 'ended' }))
          .catch(err => log('play_rejected', { from: 'ended', error: String(err?.message ?? err) }))
      } else {
        log('advance_loop_to_start')
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
      log('event_play')
      userPausedRef.current = false
      setIsPlaying(true)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
    }
    const onPause = () => {
      // Capture user-initiated flag BEFORE the branch flips it, so the log
      // reflects what we thought when the event arrived.
      log('event_pause', { user_initiated: userPausedRef.current })
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
    // Diagnostic-only listeners: capture state transitions that often
    // precede the "no avanza a la siguiente" failure on Android.
    const onStalled = () => log('event_stalled')
    const onWaiting = () => log('event_waiting')
    const onCanPlay = () => log('event_canplay')
    const onError = () =>
      log('event_error', {
        error_code: audio.error?.code ?? null,
        error_message: audio.error?.message ?? null
      })

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('stalled', onStalled)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('error', onError)
    log('mount')

    // Preload the initial track so the first play() responds instantly to
    // the user's gesture (which is also what unlocks autoplay for the rest
    // of the session on iOS).
    const initial = sortedSongsRef.current.find(s => s.id === currentSongIdRef.current)
    if (initial) audio.src = initial.audioSrc

    return () => {
      log('unmount')
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('stalled', onStalled)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
      if (audio.parentNode) audio.parentNode.removeChild(audio)
      audioRef.current = null
    }
  }, [log])

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

  // Diagnostic: log page lifecycle so we can correlate audio events with
  // Chrome's freeze/resume on Android. `pagehide` and `freeze` are the
  // critical signals — when the tab freezes, our JS stops running until
  // `resume` / `pageshow`. If the bug reproduces during that gap, the last
  // event before `freeze` (or the absence of `resume`) tells us why.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVis = () => log('visibility_change', { visibility: document.visibilityState })
    const onHide = (e: PageTransitionEvent) => log('pagehide', { persisted: e.persisted })
    const onShow = (e: PageTransitionEvent) => log('pageshow', { persisted: e.persisted })
    const onFreeze = () => log('freeze')
    const onResume = () => log('resume')
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', onHide)
    window.addEventListener('pageshow', onShow)
    // `freeze`/`resume` are page-lifecycle API events, Chrome-only. Cast to
    // any since lib.dom doesn't declare them on Document.
    ;(document as unknown as EventTarget).addEventListener('freeze', onFreeze)
    ;(document as unknown as EventTarget).addEventListener('resume', onResume)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', onHide)
      window.removeEventListener('pageshow', onShow)
      ;(document as unknown as EventTarget).removeEventListener('freeze', onFreeze)
      ;(document as unknown as EventTarget).removeEventListener('resume', onResume)
    }
  }, [log])

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
    log('action_play')
    userPausedRef.current = false
    setIsStopped(false)
    // The audio element's 'play' event will set mediaSession to 'playing'
    // once playback actually starts. Avoid eager updates so we don't desync
    // from the underlying audio state on iOS.
    audioRef.current
      ?.play()
      .then(() => log('play_resolved', { from: 'action_play' }))
      .catch(err => log('play_rejected', { from: 'action_play', error: String(err?.message ?? err) }))
  }, [log])

  const pause = useCallback(() => {
    log('action_pause')
    userPausedRef.current = true
    // Don't eagerly set mediaSession='paused' or isPlaying=false here.
    // On iOS, audio.pause() may fail silently while the page is in the
    // background; if we eagerly mark paused, the lock-screen icon would
    // flip to "play" even though audio kept playing. Let the audio's own
    // 'pause' event drive the state update via onPause.
    audioRef.current?.pause()
  }, [log])

  const stop = useCallback(() => {
    log('action_stop')
    const audio = audioRef.current
    if (!audio) return
    userPausedRef.current = true
    audio.pause()
    audio.currentTime = 0
    setElapsedSeconds(0)
    setIsStopped(true)
  }, [log])

  const next = useCallback(() => {
    log('action_next')
    const audio = audioRef.current
    if (!audio) return
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongIdRef.current)
    if (idx < sorted.length - 1) {
      const nextSong = sorted[idx + 1]
      setIsStopped(false)
      setCurrentSongId(nextSong.id)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
      audio.src = nextSong.audioSrc
      audio.currentTime = 0
      audio
        .play()
        .then(() => log('play_resolved', { from: 'action_next' }))
        .catch(err => log('play_rejected', { from: 'action_next', error: String(err?.message ?? err) }))
    }
  }, [log])

  const prev = useCallback(() => {
    log('action_prev')
    const audio = audioRef.current
    if (!audio) return
    const sorted = sortedSongsRef.current
    const idx = sorted.findIndex(s => s.id === currentSongIdRef.current)

    // Standard behaviour: if more than 3 s in, restart current song
    if (audio.currentTime > 3) {
      audio.currentTime = 0
      setElapsedSeconds(0)
      return
    }

    // Otherwise go to previous song
    if (idx > 0) {
      const prevSong = sorted[idx - 1]
      setIsStopped(false)
      setCurrentSongId(prevSong.id)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
      audio.src = prevSong.audioSrc
      audio.currentTime = 0
      audio
        .play()
        .then(() => log('play_resolved', { from: 'action_prev' }))
        .catch(err => log('play_rejected', { from: 'action_prev', error: String(err?.message ?? err) }))
    }
  }, [log])

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
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

    // Wrap each handler so the log records that the OS-level control fired
    // (vs the UI button). On Android this is critical: when the screen is
    // locked and the user hits "next" on the lock screen, this is the only
    // entry point — if we don't see `ms_nexttrack` in the timeline, the OS
    // never invoked us.
    setHandler('play', () => {
      log('ms_play')
      play()
    })
    setHandler('pause', () => {
      log('ms_pause')
      pause()
    })
    setHandler('previoustrack', () => {
      log('ms_previoustrack')
      prev()
    })
    setHandler('nexttrack', () => {
      log('ms_nexttrack')
      next()
    })
    setHandler('stop', () => {
      log('ms_stop')
      stop()
    })
    setHandler('seekto', details => {
      log('ms_seekto', { seek_time: details.seekTime ?? null })
      const audio = audioRef.current
      if (!audio || details.seekTime == null) return
      audio.currentTime = details.seekTime
    })

    return () => {
      ;(['play', 'pause', 'previoustrack', 'nexttrack', 'stop', 'seekto'] as MediaSessionAction[]).forEach(a =>
        setHandler(a, null)
      )
    }
  }, [play, pause, next, prev, stop, log])

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
      log('action_play_song', { target_song_id: id })
      const audio = audioRef.current
      if (!audio) return
      const song = songs.find(s => s.id === id)
      if (!song) return

      setIsStopped(false)
      setCurrentSongId(id)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
      audio.src = song.audioSrc
      audio.currentTime = 0
      audio
        .play()
        .then(() => log('play_resolved', { from: 'play_song' }))
        .catch(err => log('play_rejected', { from: 'play_song', error: String(err?.message ?? err) }))
    },
    [songs, log]
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

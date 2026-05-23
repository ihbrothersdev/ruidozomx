/**
 * Player diagnostic logger — writes audio-player events to
 * `public.player_debug_logs` in Supabase so we can reconstruct what happened
 * during background playback on Android (where Chrome freezes the tab and
 * we can't attach devtools).
 *
 * Activation (any of these enables it; flag persists in localStorage):
 *   - Visit any page with `?debug=player`
 * Deactivation:
 *   - Visit any page with `?debug=off`
 *
 * Implementation notes:
 *   - Uses `fetch(..., { keepalive: true })` directly against PostgREST so
 *     the request survives `pagehide` / tab freeze. supabase-js does not
 *     expose the keepalive flag, which is the whole point on Android.
 *   - All failures swallowed: logging must never break playback.
 */

import { getSupabaseEnv } from './supabase/env'

const DEBUG_FLAG_KEY = 'rdz_player_debug'

let cachedEnabled: boolean | null = null
let cachedSessionId: string | null = null

function getEnabled(): boolean {
  if (cachedEnabled !== null) return cachedEnabled
  if (typeof window === 'undefined') return false
  try {
    const params = new URLSearchParams(window.location.search)
    const flag = params.get('debug')
    if (flag === 'player') {
      window.localStorage.setItem(DEBUG_FLAG_KEY, '1')
      cachedEnabled = true
      return true
    }
    if (flag === 'off') {
      window.localStorage.removeItem(DEBUG_FLAG_KEY)
      cachedEnabled = false
      return false
    }
    cachedEnabled = window.localStorage.getItem(DEBUG_FLAG_KEY) === '1'
    return cachedEnabled
  } catch {
    cachedEnabled = false
    return false
  }
}

function getSessionId(): string {
  if (cachedSessionId) return cachedSessionId
  try {
    cachedSessionId = crypto.randomUUID()
  } catch {
    // Older browsers without crypto.randomUUID (shouldn't happen on modern Chrome/Safari).
    cachedSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
  return cachedSessionId
}

export function isPlayerDebugEnabled(): boolean {
  return getEnabled()
}

export function getPlayerDebugSessionId(): string | null {
  return getEnabled() ? getSessionId() : null
}

/** Compact snapshot of the audio element's state at the moment of an event. */
export function snapshotAudio(audio: HTMLAudioElement | null) {
  if (!audio) {
    return {
      audio_paused: null,
      audio_ended: null,
      audio_ready_state: null,
      audio_network_state: null,
      audio_current_time: null,
      audio_duration: null
    }
  }
  const dur = audio.duration
  return {
    audio_paused: audio.paused,
    audio_ended: audio.ended,
    audio_ready_state: audio.readyState,
    audio_network_state: audio.networkState,
    audio_current_time: Number((audio.currentTime || 0).toFixed(2)),
    audio_duration: Number.isFinite(dur) ? Number(dur.toFixed(2)) : null
  }
}

export interface PlayerLogInput {
  event_type: string
  song_id?: string | null
  song_index?: number | null
  audio_paused?: boolean | null
  audio_ended?: boolean | null
  audio_ready_state?: number | null
  audio_network_state?: number | null
  audio_current_time?: number | null
  audio_duration?: number | null
  payload?: Record<string, unknown> | null
}

export function logPlayerEvent(input: PlayerLogInput): void {
  if (!getEnabled()) return
  if (typeof window === 'undefined') return

  let url: string
  let key: string
  try {
    const env = getSupabaseEnv()
    url = `${env.url}/rest/v1/player_debug_logs`
    key = env.anonKey
  } catch {
    return
  }

  const body = JSON.stringify({
    session_id: getSessionId(),
    event_type: input.event_type,
    song_id: input.song_id ?? null,
    song_index: input.song_index ?? null,
    audio_paused: input.audio_paused ?? null,
    audio_ended: input.audio_ended ?? null,
    audio_ready_state: input.audio_ready_state ?? null,
    audio_network_state: input.audio_network_state ?? null,
    audio_current_time: input.audio_current_time ?? null,
    audio_duration: input.audio_duration ?? null,
    visibility_state: typeof document !== 'undefined' ? document.visibilityState : null,
    user_agent: navigator.userAgent,
    payload: input.payload ?? null
  })

  try {
    // `keepalive: true` is the whole point — it tells the browser this
    // request must complete even if the page is being unloaded or frozen.
    void fetch(url, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body,
      keepalive: true
    }).catch(() => {})
  } catch {
    // Never throw from a logger.
  }
}

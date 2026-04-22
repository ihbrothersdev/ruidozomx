'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export type SongEventType =
  | 'play_start'
  | 'play_complete'
  | 'play_progress'
  | 'profile_click'
  | 'interest_click'
  | 'share_click'
  | 'cassette_session_start'
  | 'cassette_session_end'

const VALID_TYPES = new Set<SongEventType>([
  'play_start',
  'play_complete',
  'play_progress',
  'profile_click',
  'interest_click',
  'share_click',
  'cassette_session_start',
  'cassette_session_end'
])

export interface LogEventInput {
  type: SongEventType
  songId?: string | null
  cassetteId?: string | null
  sessionId?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Logs an analytics event. Accepts both authenticated and anonymous users:
 * - If logged in, `user_id` is set from the session.
 * - If anonymous, only `session_id` (a client-generated cookie/localStorage uuid) groups the events.
 *
 * Uses service role to bypass RLS so writes are reliable; the inserted columns
 * (user_id) are derived from the verified session, not the client payload.
 */
export async function logEvent(input: LogEventInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input || !input.type || !VALID_TYPES.has(input.type)) {
    return { ok: false, error: 'tipo_invalido' }
  }
  if (!input.songId && !input.cassetteId) {
    return { ok: false, error: 'sin_referencia' }
  }

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const svc = createServiceClient()
  const { error } = await svc.from('song_events').insert({
    type: input.type,
    song_id: input.songId ?? null,
    cassette_id: input.cassetteId ?? null,
    user_id: user?.id ?? null,
    session_id: input.sessionId ?? null,
    metadata: input.metadata ?? {}
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

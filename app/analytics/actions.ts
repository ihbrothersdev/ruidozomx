'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export type SongEventType =
  | 'play_start'
  | 'play_complete'
  | 'profile_click'
  | 'interest_click'
  | 'share_click'
  | 'cassette_session_start'
  | 'cassette_session_end'

const VALID_TYPES = new Set<SongEventType>([
  'play_start',
  'play_complete',
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

export type DonationEventType = 'donation_start' | 'donation_attempt'

const VALID_DONATION_TYPES = new Set<DonationEventType>(['donation_start', 'donation_attempt'])

export interface LogDonationInput {
  type: DonationEventType
  /** `once` for one-time amounts, `monthly` for recurring. */
  frequency?: 'once' | 'monthly' | null
  /** Selected amount, if any (null for "otro monto" / the initial Cooperar click). */
  amountMxn?: number | null
  amountUsd?: number | null
  sessionId?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Logs a donation-flow event (attempt/intent, not a confirmed payment — Stripe
 * owns that). Works for authenticated and anonymous visitors, exactly like
 * `logEvent`: `user_id` comes from the verified session, `session_id` groups
 * anonymous clicks. Fire-and-forget from the client; navigation never waits.
 */
export async function logDonationClick(
  input: LogDonationInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input || !input.type || !VALID_DONATION_TYPES.has(input.type)) {
    return { ok: false, error: 'tipo_invalido' }
  }

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const svc = createServiceClient()
  const { error } = await svc.from('donation_events').insert({
    type: input.type,
    user_id: user?.id ?? null,
    session_id: input.sessionId ?? null,
    frequency: input.frequency ?? null,
    amount_mxn: input.amountMxn ?? null,
    amount_usd: input.amountUsd ?? null,
    metadata: input.metadata ?? {}
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

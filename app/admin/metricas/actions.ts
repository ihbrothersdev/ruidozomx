'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { windowToDate, type SinceWindow } from './_lib/aggregations'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion?e=no_autorizado')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')
  return user
}

export type SongDetailListener = {
  user_id: string
  display_name: string | null
  slug: string | null
  photo_url: string | null
  plays: number
  completes: number
  last_played_at: string
}

export type SongDetail = {
  ok: true
  song: { id: string; title: string; artist: string; cassette_name: string; side: 'A' | 'B'; position: number }
  totals: {
    plays_total: number
    plays_authenticated: number
    plays_anonymous: number
    completes: number
    profile_clicks: number
    interest_clicks: number
    share_clicks: number
    unique_listeners: number
    unique_anon_sessions: number
  }
  listeners: SongDetailListener[]
  top_anonymous_sessions: { session_id: string; plays: number; first_at: string }[]
}

/**
 * Returns aggregated detail for a single song within an optional time window.
 * Used by the row-click drill-down dialog in the admin metrics table.
 */
export async function getSongDetail(songId: string, since: SinceWindow): Promise<SongDetail | { ok: false; error: string }> {
  await requireAdmin()
  const svc = createServiceClient()

  if (!songId) return { ok: false, error: 'faltan_datos' }

  const { data: song } = await svc
    .from('songs')
    .select('id, title, artist, side, position, cassette_id, cassettes(name)')
    .eq('id', songId)
    .maybeSingle()
  if (!song) return { ok: false, error: 'cancion_no_encontrada' }

  let q = svc.from('song_events').select('type, user_id, session_id, created_at').eq('song_id', songId)
  const sinceDate = windowToDate(since)
  if (sinceDate) q = q.gte('created_at', sinceDate.toISOString())
  const { data: events } = await q
  const allEvents = events ?? []

  const plays = allEvents.filter(e => e.type === 'play_start')
  const completes = allEvents.filter(e => e.type === 'play_complete')
  const authPlays = plays.filter(e => e.user_id)
  const anonPlays = plays.filter(e => !e.user_id && e.session_id)

  // Group plays/completes per authenticated user.
  const byUser = new Map<string, { plays: number; completes: number; last_played_at: string }>()
  for (const e of allEvents) {
    if (!e.user_id) continue
    if (e.type !== 'play_start' && e.type !== 'play_complete') continue
    const bucket = byUser.get(e.user_id) ?? { plays: 0, completes: 0, last_played_at: e.created_at }
    if (e.type === 'play_start') bucket.plays++
    if (e.type === 'play_complete') bucket.completes++
    if (e.created_at > bucket.last_played_at) bucket.last_played_at = e.created_at
    byUser.set(e.user_id, bucket)
  }

  // Resolve profiles for the listed user_ids in one query.
  const userIds = Array.from(byUser.keys())
  let profiles: { id: string; display_name: string | null; slug: string | null; photo_url: string | null }[] = []
  if (userIds.length > 0) {
    const { data } = await svc.from('profiles').select('id, display_name, slug, photo_url').in('id', userIds)
    profiles = data ?? []
  }
  const profileById = new Map(profiles.map(p => [p.id, p]))

  const listeners: SongDetailListener[] = userIds
    .map(uid => {
      const b = byUser.get(uid)!
      const p = profileById.get(uid)
      return {
        user_id: uid,
        display_name: p?.display_name ?? null,
        slug: p?.slug ?? null,
        photo_url: p?.photo_url ?? null,
        plays: b.plays,
        completes: b.completes,
        last_played_at: b.last_played_at
      }
    })
    .sort((a, b) => b.plays - a.plays)

  // Group anonymous plays per session.
  const bySession = new Map<string, { plays: number; first_at: string }>()
  for (const e of anonPlays) {
    if (!e.session_id) continue
    const bucket = bySession.get(e.session_id) ?? { plays: 0, first_at: e.created_at }
    bucket.plays++
    if (e.created_at < bucket.first_at) bucket.first_at = e.created_at
    bySession.set(e.session_id, bucket)
  }
  const top_anonymous_sessions = Array.from(bySession.entries())
    .map(([session_id, b]) => ({ session_id, plays: b.plays, first_at: b.first_at }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 5)

  const cassetteName =
    (Array.isArray(song.cassettes) ? song.cassettes[0]?.name : (song.cassettes as { name?: string } | null)?.name) ??
    'Sin nombre'

  return {
    ok: true,
    song: {
      id: song.id,
      title: song.title,
      artist: song.artist,
      cassette_name: cassetteName,
      side: song.side as 'A' | 'B',
      position: song.position
    },
    totals: {
      plays_total: plays.length,
      plays_authenticated: authPlays.length,
      plays_anonymous: anonPlays.length,
      completes: completes.length,
      profile_clicks: allEvents.filter(e => e.type === 'profile_click').length,
      interest_clicks: allEvents.filter(e => e.type === 'interest_click').length,
      share_clicks: allEvents.filter(e => e.type === 'share_click').length,
      unique_listeners: new Set(authPlays.map(e => e.user_id)).size,
      unique_anon_sessions: new Set(anonPlays.map(e => e.session_id)).size
    },
    listeners,
    top_anonymous_sessions
  }
}

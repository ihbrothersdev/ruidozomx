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

  // Resolve roles for the involved users so admins can be dropped from every count.
  const eventUserIds = Array.from(new Set(allEvents.map(e => e.user_id).filter(Boolean))) as string[]
  let profiles: {
    id: string
    display_name: string | null
    slug: string | null
    photo_url: string | null
    role: string
  }[] = []
  if (eventUserIds.length > 0) {
    const { data } = await svc.from('profiles').select('id, display_name, slug, photo_url, role').in('id', eventUserIds)
    profiles = data ?? []
  }
  const adminIds = new Set(profiles.filter(p => p.role === 'admin').map(p => p.id))
  const profileById = new Map(profiles.map(p => [p.id, p]))

  const isAdminEvent = (e: { user_id: string | null }) => !!e.user_id && adminIds.has(e.user_id)
  // Logged-in, non-admin only. Anonymous plays are excluded from the detail.
  const isIdentified = (e: { user_id: string | null }) => !!e.user_id && !adminIds.has(e.user_id)

  // Plays/completes excluding admins, but keeping anonymous activity in the totals.
  const plays = allEvents.filter(e => e.type === 'play_start' && !isAdminEvent(e))
  const authPlays = plays.filter(e => e.user_id)
  const anonPlays = plays.filter(e => !e.user_id && e.session_id)
  const completes = allEvents.filter(e => e.type === 'play_complete' && !isAdminEvent(e))

  // Group plays/completes per authenticated non-admin user.
  const byUser = new Map<string, { plays: number; completes: number; last_played_at: string }>()
  for (const e of allEvents) {
    if (!isIdentified(e)) continue
    if (e.type !== 'play_start' && e.type !== 'play_complete') continue
    const bucket = byUser.get(e.user_id!) ?? { plays: 0, completes: 0, last_played_at: e.created_at }
    if (e.type === 'play_start') bucket.plays++
    if (e.type === 'play_complete') bucket.completes++
    if (e.created_at > bucket.last_played_at) bucket.last_played_at = e.created_at
    byUser.set(e.user_id!, bucket)
  }

  const listeners: SongDetailListener[] = Array.from(byUser.keys())
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
      profile_clicks: allEvents.filter(e => e.type === 'profile_click' && !isAdminEvent(e)).length,
      interest_clicks: allEvents.filter(e => e.type === 'interest_click' && !isAdminEvent(e)).length,
      share_clicks: allEvents.filter(e => e.type === 'share_click' && !isAdminEvent(e)).length,
      unique_listeners: byUser.size,
      unique_anon_sessions: new Set(anonPlays.map(e => e.session_id)).size
    },
    listeners
  }
}

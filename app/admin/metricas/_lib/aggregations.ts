/**
 * Aggregation helpers for the admin metrics page.
 *
 * We bypass the SQL RPCs (`song_metrics`, `cassette_metrics`) so that we can
 * apply an arbitrary time window without having to migrate the database
 * functions. The volume of `song_events` is small enough (single-digit
 * thousands per cassette) that aggregating in JS is fast and avoids round-trips.
 */

export type SongEventType =
  | 'cassette_session_start'
  | 'cassette_session_end'
  | 'play_start'
  | 'play_complete'
  | 'profile_click'
  | 'interest_click'
  | 'share_click'

export type SongEvent = {
  id: string
  type: SongEventType
  song_id: string | null
  cassette_id: string | null
  user_id: string | null
  session_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type SongRow = {
  id: string
  title: string
  artist: string
  side: 'A' | 'B'
  position: number
  cassette_id: string
  cassette_name: string
}

export type CassetteRow = {
  id: string
  name: string
  active: boolean
  archived: boolean
  is_next: boolean
}

export type SongMetricRow = SongRow & {
  song_id: string
  track_position: number
  plays_total: number
  plays_authenticated: number
  unique_listeners: number
  unique_anon_sessions: number
  completes: number
  completion_rate: number
  profile_clicks: number
  interest_clicks: number
  share_clicks: number
}

export type CassetteMetricRow = {
  cassette_id: string
  cassette_name: string
  active: boolean
  archived: boolean
  is_next: boolean
  sessions_started: number
  sessions_finished: number
  unique_session_users: number
  unique_anon_sessions: number
  total_plays: number
  total_completes: number
}

export type DailyPoint = {
  date: string // YYYY-MM-DD
  plays: number
  completes: number
  sessions: number
}

export type SinceWindow = '24h' | '7d' | '30d' | 'all'

export function windowToDate(window: SinceWindow): Date | null {
  const now = Date.now()
  switch (window) {
    case '24h':
      return new Date(now - 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now - 30 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

export function aggregateSongMetrics(songs: SongRow[], events: SongEvent[]): SongMetricRow[] {
  // Pre-bucket events by song_id for O(1) lookup.
  const bySong = new Map<string, SongEvent[]>()
  for (const e of events) {
    if (!e.song_id) continue
    if (!bySong.has(e.song_id)) bySong.set(e.song_id, [])
    bySong.get(e.song_id)!.push(e)
  }

  return songs.map(song => {
    const sEvents = bySong.get(song.id) ?? []
    const plays = sEvents.filter(e => e.type === 'play_start')
    const completes = sEvents.filter(e => e.type === 'play_complete')
    const authPlays = plays.filter(e => e.user_id)
    const anonPlays = plays.filter(e => !e.user_id && e.session_id)
    const playsTotal = plays.length
    const completesTotal = completes.length

    return {
      ...song,
      song_id: song.id,
      track_position: song.position,
      plays_total: playsTotal,
      plays_authenticated: authPlays.length,
      unique_listeners: new Set(authPlays.map(e => e.user_id)).size,
      unique_anon_sessions: new Set(anonPlays.map(e => e.session_id)).size,
      completes: completesTotal,
      completion_rate: playsTotal === 0 ? 0 : Math.round((completesTotal / playsTotal) * 100),
      profile_clicks: sEvents.filter(e => e.type === 'profile_click').length,
      interest_clicks: sEvents.filter(e => e.type === 'interest_click').length,
      share_clicks: sEvents.filter(e => e.type === 'share_click').length
    }
  })
}

export function aggregateCassetteMetrics(cassettes: CassetteRow[], events: SongEvent[]): CassetteMetricRow[] {
  const byCassette = new Map<string, SongEvent[]>()
  for (const e of events) {
    if (!e.cassette_id) continue
    if (!byCassette.has(e.cassette_id)) byCassette.set(e.cassette_id, [])
    byCassette.get(e.cassette_id)!.push(e)
  }

  return cassettes
    .map(c => {
      const cEvents = byCassette.get(c.id) ?? []
      const starts = cEvents.filter(e => e.type === 'cassette_session_start')
      const ends = cEvents.filter(e => e.type === 'cassette_session_end')
      const plays = cEvents.filter(e => e.type === 'play_start')
      const completes = cEvents.filter(e => e.type === 'play_complete')
      const authStarts = starts.filter(e => e.user_id)
      const anonStarts = starts.filter(e => !e.user_id && e.session_id)

      return {
        cassette_id: c.id,
        cassette_name: c.name,
        active: c.active,
        archived: c.archived,
        is_next: c.is_next,
        sessions_started: starts.length,
        sessions_finished: ends.length,
        unique_session_users: new Set(authStarts.map(e => e.user_id)).size,
        unique_anon_sessions: new Set(anonStarts.map(e => e.session_id)).size,
        total_plays: plays.length,
        total_completes: completes.length
      }
    })
    .sort((a, b) => b.sessions_started - a.sessions_started)
}

/**
 * Daily-bucketed series for the temporal chart. We always backfill empty days
 * inside the window so the chart x-axis stays continuous.
 */
export function buildDailySeries(events: SongEvent[], window: SinceWindow): DailyPoint[] {
  const since = windowToDate(window)
  const start = since ?? new Date(Math.min(...events.map(e => new Date(e.created_at).getTime())))
  const end = new Date()

  // Normalize to UTC midnight buckets — matches `created_at::date` in Postgres.
  const startMs = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  const endMs = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())

  const buckets = new Map<string, DailyPoint>()
  for (let t = startMs; t <= endMs; t += 86_400_000) {
    const key = new Date(t).toISOString().slice(0, 10)
    buckets.set(key, { date: key, plays: 0, completes: 0, sessions: 0 })
  }

  for (const e of events) {
    const key = e.created_at.slice(0, 10)
    const point = buckets.get(key)
    if (!point) continue
    if (e.type === 'play_start') point.plays++
    else if (e.type === 'play_complete') point.completes++
    else if (e.type === 'cassette_session_start') point.sessions++
  }

  return Array.from(buckets.values())
}

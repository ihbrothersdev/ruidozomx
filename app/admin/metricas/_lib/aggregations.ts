/**
 * Types + time-window helper for the admin metrics page.
 *
 * Aggregation itself lives in SQL (`cassette_metrics`, `song_metrics`,
 * `event_daily_series` RPCs) so it isn't subject to PostgREST's 1000-row cap on
 * un-paginated selects — pulling raw events into JS silently dropped the newest
 * cassette. These row shapes mirror those RPCs' return columns 1:1.
 */

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

export type CassetteRow = {
  id: string
  name: string
  active: boolean
  archived: boolean
  is_next: boolean
}

/** Return shape of the `cassette_metrics` RPC. */
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

/** Return shape of the `song_metrics` RPC. */
export type SongMetricRow = {
  song_id: string
  title: string
  artist: string
  side: 'A' | 'B'
  track_position: number
  cassette_id: string
  cassette_name: string
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

/** One point of the `event_daily_series` RPC, mapped for the chart. */
export type DailyPoint = {
  date: string // YYYY-MM-DD
  plays: number
  completes: number
  sessions: number
}

import type { Role } from '@/lib/types'
import { createClient } from './server'

const PER_CATEGORY_LIMIT = 8

export interface SearchProfileResult {
  id: string
  display_name: string
  slug: string
  photo_url: string | null
  role: Role
  city: string | null
  state: string | null
  country: string | null
}

export interface SearchSongResult {
  id: string
  title: string
  artist: string
  genre: string | null
  cassette_id: string
  side: 'A' | 'B'
  position: number
}

export interface SearchCassetteResult {
  id: string
  name: string | null
  curator_name: string | null
  start_date: string
  active: boolean
  cover_image_url: string | null
}

export interface SearchEventResult {
  id: string
  title: string
  description: string | null
  event_date: string
  venue_name: string | null
  city: string | null
  state: string | null
  cover_image_url: string | null
}

export interface SearchResults {
  query: string
  profiles: SearchProfileResult[]
  songs: SearchSongResult[]
  cassettes: SearchCassetteResult[]
  events: SearchEventResult[]
  total: number
}

const EMPTY: Omit<SearchResults, 'query'> = {
  profiles: [],
  songs: [],
  cassettes: [],
  events: [],
  total: 0
}

/** Escape `%`, `_` and `,` so the term is treated literally inside `ilike` / `or` filters. */
function escapeForILike(value: string): string {
  return value.replace(/[%_,()]/g, '\\$&')
}

/** Lowercase, trim, collapse whitespace, strip diacritics. Used for the song
 *  dedup so "Niña Fatal" and "Nina Fatal" collapse to the same bucket. */
function normalizeForDedup(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Run a global search across the public-facing tables (profiles, songs, cassettes, events).
 * Returns at most PER_CATEGORY_LIMIT rows per category. An empty / whitespace-only query
 * short-circuits to an empty result set.
 */
export async function searchAll(rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim()
  if (!query) return { query, ...EMPTY }

  const supabase = await createClient()
  const term = `%${escapeForILike(query)}%`

  const [profilesRes, songsRes, cassettesRes, eventsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, slug, photo_url, role, city, state, country')
      .eq('active', true)
      .neq('role', 'admin')
      .or(`display_name.ilike.${term},slug.ilike.${term},bio.ilike.${term},city.ilike.${term},state.ilike.${term}`)
      .limit(PER_CATEGORY_LIMIT),

    supabase
      .from('songs')
      .select('id, title, artist, genre, cassette_id, side, position')
      .or(`title.ilike.${term},artist.ilike.${term},genre.ilike.${term}`)
      .limit(PER_CATEGORY_LIMIT),

    supabase
      .from('cassettes')
      .select('id, name, curator_name, start_date, active, cover_image_url')
      .or(`name.ilike.${term},curator_name.ilike.${term}`)
      .order('start_date', { ascending: false })
      .limit(PER_CATEGORY_LIMIT),

    supabase
      .from('events')
      .select('id, title, description, event_date, venue_name, city, state, cover_image_url')
      .eq('status', 'published')
      .or(
        `title.ilike.${term},description.ilike.${term},venue_name.ilike.${term},city.ilike.${term},state.ilike.${term}`
      )
      .order('event_date', { ascending: true })
      .limit(PER_CATEGORY_LIMIT)
  ])

  const profiles = (profilesRes.data ?? []) as SearchProfileResult[]
  const rawSongs = (songsRes.data ?? []) as SearchSongResult[]
  const cassettes = (cassettesRes.data ?? []) as SearchCassetteResult[]
  const events = (eventsRes.data ?? []) as SearchEventResult[]

  // Same track can appear in multiple cassettes (re-runs / compilations) and
  // each row is a separate `songs` record. Collapse by (title, artist) so the
  // search panel doesn't show the same song twice with different A7 / B2 tags.
  // The same name is occasionally typed with and without diacritics
  // ("Niña Fatal" vs "Nina Fatal"), so strip those before matching.
  const seen = new Set<string>()
  const songs: SearchSongResult[] = []
  for (const s of rawSongs) {
    const key = `${normalizeForDedup(s.title)}::${normalizeForDedup(s.artist)}`
    if (seen.has(key)) continue
    seen.add(key)
    songs.push(s)
  }

  return {
    query,
    profiles,
    songs,
    cassettes,
    events,
    total: profiles.length + songs.length + cassettes.length + events.length
  }
}

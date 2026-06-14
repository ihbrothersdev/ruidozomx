import { ROLE_LABELS, ROLES, type Role } from '@/lib/types'
import { createClient } from './server'

const PER_CATEGORY_LIMIT = 8
// Profiles/songs have no inherent order, so a bare LIMIT returns arbitrary
// rows. Fetch a wider pool, rank by relevance, then trim to PER_CATEGORY_LIMIT.
const RANK_FETCH_LIMIT = PER_CATEGORY_LIMIT * 3

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

export interface SearchEventResult {
  id: string
  title: string
  description: string | null
  event_date: string
  venue_name: string | null
  city: string | null
  state: string | null
  cover_image_url: string | null
  /** Slug of the band that proposed the event (events.profile_id), for linking
   *  the result to /perfil/[slug]. Null when that profile has no public slug. */
  proposer_slug: string | null
}

export interface SearchResults {
  query: string
  profiles: SearchProfileResult[]
  songs: SearchSongResult[]
  events: SearchEventResult[]
  total: number
}

const EMPTY: Omit<SearchResults, 'query'> = {
  profiles: [],
  songs: [],
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

function rolesMatchingQuery(normalizedQuery: string): Role[] {
  if (normalizedQuery.length < 3) return []
  return ROLES.filter(role => {
    if (role === 'admin') return false
    const tokens = [role, ...ROLE_LABELS[role].split(/[^a-záéíóúñ]+/i)]
      .map(normalizeForDedup)
      .filter(t => t.length >= 3)
    return tokens.some(t => t.includes(normalizedQuery) || normalizedQuery.includes(t))
  })
}

/** Rows where a matched field STARTS with the query rank above mere substring
 *  matches. Stable sort keeps the DB order within each tier. */
function rankByPrefix<T>(rows: T[], normalizedQuery: string, fields: (row: T) => (string | null | undefined)[]): T[] {
  const score = (row: T) => (fields(row).some(f => f && normalizeForDedup(f).startsWith(normalizedQuery)) ? 0 : 1)
  return [...rows].sort((a, b) => score(a) - score(b))
}

/**
 * Run a global search across the public-facing tables (profiles, songs, events).
 * Returns at most PER_CATEGORY_LIMIT rows per category. An empty / whitespace-only query
 * short-circuits to an empty result set.
 */
export async function searchAll(rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim()
  if (!query) return { query, ...EMPTY }

  const supabase = await createClient()
  const escaped = escapeForILike(query)
  const term = `%${escaped}%` // substring match (name, slug, song fields)
  const prefixTerm = `${escaped}%` // prefix match (city, state)

  const matchedRoles = rolesMatchingQuery(normalizeForDedup(query))
  // City/state use a PREFIX match, not substring: a substring match made
  // "pop" hit "Za-pop-an" and surfaced every band from Zapopan. Prefix still
  // supports typeahead ("guad" → "Guadalajara") without the mid-word noise.
  //
  // `bio` is intentionally NOT searched — free-text bios produced the same
  // class of noisy substring hits. Band genre is searched separately below
  // via `band_profiles.genre`.
  const profileFilter = [
    `display_name.ilike.${term}`,
    `slug.ilike.${term}`,
    `city.ilike.${prefixTerm}`,
    `state.ilike.${prefixTerm}`,
    ...(matchedRoles.length ? [`role.in.(${matchedRoles.join(',')})`] : [])
  ].join(',')

  const [profilesRes, genreBandsRes, songsRes, eventsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, slug, photo_url, role, city, state, country')
      .eq('active', true)
      .neq('role', 'admin')
      .or(profileFilter)
      .limit(RANK_FETCH_LIMIT),

    // Bands whose main genre matches the term (band_profiles.genre). Inner-join
    // profiles so we get full profile rows + can drop inactive accounts.
    supabase
      .from('band_profiles')
      .select('profiles!inner(id, display_name, slug, photo_url, role, city, state, country, active)')
      .ilike('genre', term)
      .limit(RANK_FETCH_LIMIT),

    supabase
      .from('songs')
      .select('id, title, artist, genre, cassette_id, side, position')
      .or(`title.ilike.${term},artist.ilike.${term},genre.ilike.${term}`)
      .limit(RANK_FETCH_LIMIT),

    supabase
      .from('events')
      // `proposer` disambiguates the FK: events has two profile refs
      // (profile_id = proposing band, venue_profile_id = venue).
      .select(
        'id, title, description, event_date, venue_name, city, state, cover_image_url, proposer:profiles!profile_id(slug)'
      )
      .eq('status', 'published')
      .or(
        `title.ilike.${term},description.ilike.${term},venue_name.ilike.${term},city.ilike.${term},state.ilike.${term}`
      )
      .order('event_date', { ascending: true })
      .limit(PER_CATEGORY_LIMIT)
  ])

  const nq = normalizeForDedup(query)

  // Merge name/slug/city/state matches with the genre-matched bands, deduped
  // by profile id. The genre embed comes back as `{ profiles: {...} }`.
  type GenreBandRow = { profiles: (SearchProfileResult & { active: boolean }) | null }
  const genreProfiles = ((genreBandsRes.data ?? []) as unknown as GenreBandRow[])
    .map(r => r.profiles)
    .filter((p): p is SearchProfileResult & { active: boolean } => !!p && p.active)
    .map(({ active: _active, ...p }) => p as SearchProfileResult)

  const mergedProfiles = new Map<string, SearchProfileResult>()
  for (const p of [...((profilesRes.data ?? []) as SearchProfileResult[]), ...genreProfiles]) {
    if (!mergedProfiles.has(p.id)) mergedProfiles.set(p.id, p)
  }

  const profiles = rankByPrefix([...mergedProfiles.values()], nq, p => [p.display_name, p.slug]).slice(
    0,
    PER_CATEGORY_LIMIT
  )
  const rawSongs = (songsRes.data ?? []) as SearchSongResult[]
  // supabase-js can't infer the disambiguated FK embed, so type the row by hand.
  type EventRow = Omit<SearchEventResult, 'proposer_slug'> & {
    proposer: { slug: string | null } | { slug: string | null }[] | null
  }
  const events = ((eventsRes.data ?? []) as unknown as EventRow[]).map(({ proposer, ...e }) => ({
    ...e,
    proposer_slug: (Array.isArray(proposer) ? proposer[0]?.slug : proposer?.slug) ?? null
  })) as SearchEventResult[]

  // Same track can appear in multiple cassettes (re-runs / compilations) and
  // each row is a separate `songs` record. Collapse by (title, artist) so the
  // search panel doesn't show the same song twice with different A7 / B2 tags.
  // The same name is occasionally typed with and without diacritics
  // ("Niña Fatal" vs "Nina Fatal"), so strip those before matching.
  const seen = new Set<string>()
  const deduped: SearchSongResult[] = []
  for (const s of rawSongs) {
    const key = `${normalizeForDedup(s.title)}::${normalizeForDedup(s.artist)}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(s)
  }
  const songs = rankByPrefix(deduped, nq, s => [s.title, s.artist]).slice(0, PER_CATEGORY_LIMIT)

  return {
    query,
    profiles,
    songs,
    events,
    total: profiles.length + songs.length + events.length
  }
}

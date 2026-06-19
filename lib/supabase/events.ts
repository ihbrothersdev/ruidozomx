import { createClient } from './server'

/**
 * `external_link` is free text — people paste sentences, emails or bare words
 * like "Gratis" that Next would treat as a relative route. Only keep it when
 * it's a single, absolute http(s) URL; otherwise the card falls back to the
 * organizer's profile.
 */
function sanitizeExternalUrl(value: string | null): string | null {
  if (!value) return null
  const v = value.trim()
  return /^https?:\/\/\S+$/i.test(v) ? v : null
}

export interface UpcomingEvent {
  id: string
  title: string
  event_date: string
  venue_name: string | null
  city: string | null
  state: string | null
  cover_image_url: string | null
  external_link: string | null
  /** Slug of the proposing band/organizer, for linking to /perfil/[slug]. */
  proposer_slug: string | null
}

/**
 * Published events whose date is today or later, soonest first.
 * Powers the home-page "próximos eventos" carousel; returns [] on error
 * so the caller can simply skip rendering the section.
 */
export async function getUpcomingEvents(limit = 12): Promise<UpcomingEvent[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('events')
    // `proposer` disambiguates the FK: events has two profile refs
    // (profile_id = proposing band, venue_profile_id = venue).
    .select(
      'id, title, event_date, venue_name, city, state, cover_image_url, external_link, proposer:profiles!profile_id(slug)'
    )
    .eq('status', 'published')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  // supabase-js types the disambiguated embed as an object or array; flatten to a slug.
  type EventRow = Omit<UpcomingEvent, 'proposer_slug'> & {
    proposer: { slug: string | null } | { slug: string | null }[] | null
  }
  return (data as unknown as EventRow[]).map(({ proposer, ...rest }) => ({
    ...rest,
    external_link: sanitizeExternalUrl(rest.external_link),
    proposer_slug: (Array.isArray(proposer) ? proposer[0]?.slug : proposer?.slug) ?? null
  }))
}

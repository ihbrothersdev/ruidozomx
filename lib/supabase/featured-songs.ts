import { isPlayableAudio } from '@/lib/audio'
import { LIVE_PROPOSAL_STATUSES } from '@/lib/supabase/proposals'
import type { FeaturedSongSource, FeaturedSongView } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

type DbClient = SupabaseClient

function toView(
  type: FeaturedSongSource,
  id: string,
  title: string,
  artist: string,
  audioUrl: string | null,
  externalLink: string | null,
  accepted: boolean
): FeaturedSongView {
  return {
    key: `${type}:${id}`,
    type,
    id,
    title,
    artist,
    audioUrl: audioUrl ?? null,
    externalLink: externalLink ?? null,
    isPlayable: isPlayableAudio(audioUrl),
    accepted
  }
}

/**
 * A band's "Dale play" block. No longer curated — it *is* the band's rolas:
 *
 *   1. the proposals taking up its 3 slots, in `featured_order` (seeded from the
 *      old manual picks) and newest-first for anything unordered;
 *   2. everything that already made it onto a cassette, flagged `accepted`.
 *
 * Accepted rolas hang around on purpose: entering a cassette frees the slot but
 * stays on the profile as the band's badge of honour.
 *
 * Returns every live proposal, including the extras held by bands grandfathered
 * above the cap — the profile editor needs the full list to delete from.
 * ProfileFeaturedSongs is what trims the public block down to 3.
 */
export async function getProfileFeaturedSongs(client: DbClient, profileId: string): Promise<FeaturedSongView[]> {
  const [{ data: live }, { data: cassetteTracks }, { data: acceptedProposals }] = await Promise.all([
    client
      .from('song_proposals')
      .select('id, title, artist, audio_url, external_link')
      .eq('user_id', profileId)
      .is('deleted_at', null)
      .in('status', LIVE_PROPOSAL_STATUSES)
      .order('featured_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
    client
      .from('songs')
      .select('id, title, artist, audio_url, proposal_id, created_at')
      .eq('artist_profile_id', profileId)
      .order('created_at', { ascending: false }),
    client
      .from('song_proposals')
      .select('id, title, artist, audio_url, external_link, created_at')
      .eq('user_id', profileId)
      .is('deleted_at', null)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
  ])

  const out: FeaturedSongView[] = []

  for (const p of live ?? []) {
    out.push(toView('proposal', p.id, p.title, p.artist, p.audio_url, p.external_link, false))
  }

  const tracks = cassetteTracks ?? []
  for (const s of tracks) {
    out.push(toView('song', s.id, s.title, s.artist, s.audio_url, null, true))
  }

  // An accepted proposal normally has a `songs` row (richer — real cassette
  // audio), so it's already covered above. Only surface the ones that don't.
  const claimed = new Set(tracks.map(s => s.proposal_id).filter(Boolean) as string[])
  for (const p of acceptedProposals ?? []) {
    if (claimed.has(p.id)) continue
    out.push(toView('proposal', p.id, p.title, p.artist, p.audio_url, p.external_link, true))
  }

  return out
}

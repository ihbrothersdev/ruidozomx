import { extractStorageKey, isPlayableAudio, SONGS_BUCKET } from '@/lib/audio'
import { LIVE_PROPOSAL_STATUSES } from '@/lib/supabase/proposals'
import type { FeaturedSongSource, FeaturedSongView, ProposalStatus } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

type DbClient = SupabaseClient

interface ViewInput {
  type: FeaturedSongSource
  id: string
  title: string
  artist: string
  audioUrl: string | null
  externalLink?: string | null
  downloadLink?: string | null
  accepted: boolean
  status: ProposalStatus | null
}

function toView(input: ViewInput): FeaturedSongView {
  const audioUrl = input.audioUrl ?? null
  return {
    key: `${input.type}:${input.id}`,
    type: input.type,
    id: input.id,
    title: input.title,
    artist: input.artist,
    audioUrl,
    externalLink: input.externalLink ?? null,
    downloadLink: input.downloadLink ?? null,
    isPlayable: isPlayableAudio(audioUrl),
    accepted: input.accepted,
    status: input.status,
    // "Has an MP3 of ours", which is narrower than isPlayable: an external
    // playable link doesn't count, since the "+ MP3" flow uploads to our bucket.
    hasAudio: !!audioUrl && extractStorageKey(audioUrl, SONGS_BUCKET) !== null
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
 * above the cap — the owner's view needs the full list to manage from.
 * ProfileFeaturedSongs is what trims the public block down to 3.
 */
export async function getProfileFeaturedSongs(
  client: DbClient,
  profileId: string,
  /**
   * Owner view. Gates `downloadLink`, which only the edit modal needs — it would
   * otherwise ride the RSC payload out to every anonymous visitor.
   */
  forOwner = false
): Promise<FeaturedSongView[]> {
  const [{ data: live }, { data: cassetteTracks }, { data: acceptedProposals }] = await Promise.all([
    client
      .from('song_proposals')
      .select('id, title, artist, audio_url, external_link, download_link, status')
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
      .select('id, title, artist, audio_url, external_link, download_link, created_at')
      .eq('user_id', profileId)
      .is('deleted_at', null)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
  ])

  const out: FeaturedSongView[] = []

  for (const p of live ?? []) {
    out.push({
      ...toView({
        type: 'proposal',
        id: p.id,
        title: p.title,
        artist: p.artist,
        audioUrl: p.audio_url,
        externalLink: p.external_link,
        downloadLink: forOwner ? p.download_link : null,
        accepted: false,
        status: p.status as ProposalStatus
      })
    })
  }

  const tracks = cassetteTracks ?? []
  for (const s of tracks) {
    out.push(
      toView({
        type: 'song',
        id: s.id,
        title: s.title,
        artist: s.artist,
        audioUrl: s.audio_url,
        accepted: true,
        status: null
      })
    )
  }

  // An accepted proposal normally has a `songs` row (richer — real cassette
  // audio), so it's already covered above. Only surface the ones that don't.
  const claimed = new Set(tracks.map(s => s.proposal_id).filter(Boolean) as string[])
  for (const p of acceptedProposals ?? []) {
    if (claimed.has(p.id)) continue
    out.push(
      toView({
        type: 'proposal',
        id: p.id,
        title: p.title,
        artist: p.artist,
        audioUrl: p.audio_url,
        externalLink: p.external_link,
        downloadLink: forOwner ? p.download_link : null,
        accepted: true,
        status: 'accepted'
      })
    )
  }

  return out
}

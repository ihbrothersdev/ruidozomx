import { isPlayableAudio } from '@/lib/audio'
import type { FeaturedSongSource, FeaturedSongView } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

type DbClient = SupabaseClient

function toView(
  type: FeaturedSongSource,
  id: string,
  title: string,
  artist: string,
  audioUrl: string | null,
  externalLink: string | null
): FeaturedSongView {
  return {
    key: `${type}:${id}`,
    type,
    id,
    title,
    artist,
    audioUrl: audioUrl ?? null,
    externalLink: externalLink ?? null,
    isPlayable: isPlayableAudio(audioUrl)
  }
}

/**
 * Every rola a band can feature: its own proposals plus the cassette tracks
 * linked to it. A proposal that already became a cassette track is shown only
 * as the (richer) song version.
 */
export async function getFeaturedCandidates(client: DbClient, profileId: string): Promise<FeaturedSongView[]> {
  const [{ data: proposals }, { data: songs }] = await Promise.all([
    client
      .from('song_proposals')
      .select('id, title, artist, audio_url, external_link, created_at')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false }),
    client
      .from('songs')
      .select('id, title, artist, audio_url, proposal_id, created_at')
      .eq('artist_profile_id', profileId)
      .order('created_at', { ascending: false })
  ])

  const songRows = songs ?? []
  const claimedProposalIds = new Set(songRows.map(s => s.proposal_id).filter(Boolean) as string[])

  const out: FeaturedSongView[] = []
  for (const s of songRows) {
    out.push(toView('song', s.id, s.title, s.artist, s.audio_url, null))
  }
  for (const p of proposals ?? []) {
    if (claimedProposalIds.has(p.id)) continue
    out.push(toView('proposal', p.id, p.title, p.artist, p.audio_url, p.external_link))
  }
  return out
}

/** Resolve a profile's curated featured songs, in display order. */
export async function getProfileFeaturedSongs(client: DbClient, profileId: string): Promise<FeaturedSongView[]> {
  const { data: rows } = await client
    .from('profile_featured_songs')
    .select('source_type, proposal_id, song_id, position')
    .eq('profile_id', profileId)
    .order('position', { ascending: true })

  if (!rows?.length) return []

  const proposalIds = rows.filter(r => r.source_type === 'proposal').map(r => r.proposal_id as string)
  const songIds = rows.filter(r => r.source_type === 'song').map(r => r.song_id as string)

  const [proposalsRes, songsRes] = await Promise.all([
    proposalIds.length
      ? client.from('song_proposals').select('id, title, artist, audio_url, external_link').in('id', proposalIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    songIds.length
      ? client.from('songs').select('id, title, artist, audio_url').in('id', songIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] })
  ])

  const proposalsById = new Map((proposalsRes.data ?? []).map(p => [p.id as string, p]))
  const songsById = new Map((songsRes.data ?? []).map(s => [s.id as string, s]))

  const out: FeaturedSongView[] = []
  for (const r of rows) {
    if (r.source_type === 'proposal') {
      const p = proposalsById.get(r.proposal_id as string)
      if (p)
        out.push(
          toView(
            'proposal',
            p.id as string,
            p.title as string,
            p.artist as string,
            (p.audio_url as string) ?? null,
            (p.external_link as string) ?? null
          )
        )
    } else {
      const s = songsById.get(r.song_id as string)
      if (s)
        out.push(
          toView('song', s.id as string, s.title as string, s.artist as string, (s.audio_url as string) ?? null, null)
        )
    }
  }
  return out
}

export interface FeaturedPick {
  type: FeaturedSongSource
  id: string
}

/**
 * Replace a profile's featured songs with `picks` (max 3, in order). Validates
 * each pick belongs to the profile (its own proposal, or a cassette track linked
 * to it) and silently drops anything that doesn't. Delete-then-insert.
 */
export async function saveFeaturedSongs(client: DbClient, profileId: string, picks: FeaturedPick[]): Promise<void> {
  const proposalIds = picks.filter(p => p.type === 'proposal').map(p => p.id)
  const songIds = picks.filter(p => p.type === 'song').map(p => p.id)

  const [ownedProposals, ownedSongs] = await Promise.all([
    proposalIds.length
      ? client.from('song_proposals').select('id').eq('user_id', profileId).in('id', proposalIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
    songIds.length
      ? client.from('songs').select('id').eq('artist_profile_id', profileId).in('id', songIds)
      : Promise.resolve({ data: [] as { id: string }[] })
  ])

  const okProposals = new Set((ownedProposals.data ?? []).map(r => r.id))
  const okSongs = new Set((ownedSongs.data ?? []).map(r => r.id))

  const valid = picks.filter(p => (p.type === 'proposal' ? okProposals.has(p.id) : okSongs.has(p.id))).slice(0, 3)

  await client.from('profile_featured_songs').delete().eq('profile_id', profileId)

  if (!valid.length) return

  const rows = valid.map((p, i) => ({
    profile_id: profileId,
    source_type: p.type,
    proposal_id: p.type === 'proposal' ? p.id : null,
    song_id: p.type === 'song' ? p.id : null,
    position: i + 1
  }))

  await client.from('profile_featured_songs').insert(rows)
}

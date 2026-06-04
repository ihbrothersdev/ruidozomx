import type { PlayerSong, SongOffset } from '@/lib/types'
import { createClient } from './server'

const FALLBACK_CASSETTE_NAME = 'Cassette'

/** Single silent-placeholder song so the player always has something to render. */
const FALLBACK_SONGS: PlayerSong[] = [
  {
    id: 'fallback-1',
    title: 'Próximamente',
    artist: 'Ru!dozo',
    side: 'A',
    position: 1,
    durationSeconds: 0,
    audioSrc: ''
  }
]

/**
 * Fetch songs from the active cassette.
 * Maps DB `songs` rows → `PlayerSong` for the audio player.
 * Always returns a non-empty `songs` array and a `cassetteName` so callers
 * never have to handle "no data" states.
 *
 * `cassetteStartDate` is the publication date of the active cassette
 * (`cassettes.start_date`). The cassette label uses it so the date only
 * changes when a new cassette is published, not every day.
 *
 * `concatAudioUrl` is the URL of the single concatenated MP3 (all songs
 * glued together by `npm run build-cassette`), or `null` when the cassette
 * hasn't been processed yet. When present, the player uses it as a single
 * continuous source and navigates between songs via `currentTime` instead
 * of swapping URLs — this survives Chrome's background tab freeze on
 * Android where JS-driven `src` swaps fail.
 */
export async function getActiveCassetteSongs(): Promise<{
  songs: PlayerSong[]
  cassetteName: string
  cassetteStartDate: string | null
  concatAudioUrl: string | null
}> {
  const supabase = await createClient()

  const { data: cassette } = await supabase
    .from('cassettes')
    .select('id, name, start_date, concat_audio_url, song_offsets')
    .eq('active', true)
    .single()

  if (!cassette) {
    return {
      songs: FALLBACK_SONGS,
      cassetteName: FALLBACK_CASSETTE_NAME,
      cassetteStartDate: null,
      concatAudioUrl: null
    }
  }

  const { data: rows } = await supabase
    .from('songs')
    .select('id, title, artist, duration_seconds, side, position, audio_url')
    .eq('cassette_id', cassette.id)
    .order('side', { ascending: true })
    .order('position', { ascending: true })

  if (!rows || rows.length === 0) {
    return {
      songs: FALLBACK_SONGS,
      cassetteName: cassette.name ?? FALLBACK_CASSETTE_NAME,
      cassetteStartDate: cassette.start_date ?? null,
      concatAudioUrl: null
    }
  }

  // Only honour the concatenated URL when offsets cover every song — a partial
  // or stale offsets table would corrupt navigation, so fall back to legacy
  // per-file mode in that case.
  const rawOffsets = (cassette.song_offsets as SongOffset[] | null) ?? null
  const offsetBySongId = new Map<string, SongOffset>()
  if (rawOffsets) {
    for (const o of rawOffsets) offsetBySongId.set(o.song_id, o)
  }
  const offsetsCoverAllSongs = rawOffsets !== null && rows.every(r => offsetBySongId.has(r.id))
  const concatAudioUrl =
    cassette.concat_audio_url && offsetsCoverAllSongs ? (cassette.concat_audio_url as string) : null

  const songs: PlayerSong[] = rows.map(row => {
    const off = concatAudioUrl ? offsetBySongId.get(row.id) : undefined
    return {
      id: row.id,
      title: row.title,
      artist: row.artist,
      side: row.side as 'A' | 'B',
      position: row.position,
      durationSeconds: row.duration_seconds ?? (off ? Math.round(off.end - off.start) : 0),
      audioSrc: row.audio_url ?? '',
      startSeconds: off?.start,
      endSeconds: off?.end
    }
  })

  return {
    songs,
    cassetteName: cassette.name ?? FALLBACK_CASSETTE_NAME,
    cassetteStartDate: cassette.start_date ?? null,
    concatAudioUrl
  }
}

/**
 * Resolve the playback context for a specific song. Used when a user clicks a
 * song in the search dropdown — we need every sibling track on the same
 * cassette (so prev/next still work) plus enough metadata to label the player.
 *
 * Returns null when the songId is unknown or the cassette has no rows.
 */
export async function getCassetteContextForSong(songId: string): Promise<{
  songs: PlayerSong[]
  cassetteName: string
  cassetteStartDate: string | null
  cassetteActive: boolean
  initialSongId: string
} | null> {
  const supabase = await createClient()

  const { data: song } = await supabase.from('songs').select('cassette_id').eq('id', songId).single()
  if (!song?.cassette_id) return null

  const [{ data: cassette }, { data: rows }] = await Promise.all([
    supabase.from('cassettes').select('id, name, start_date, active').eq('id', song.cassette_id).single(),
    supabase
      .from('songs')
      .select('id, title, artist, duration_seconds, side, position, audio_url')
      .eq('cassette_id', song.cassette_id)
      .order('side', { ascending: true })
      .order('position', { ascending: true })
  ])

  if (!cassette || !rows || rows.length === 0) return null

  const songs: PlayerSong[] = rows.map(row => ({
    id: row.id,
    title: row.title,
    artist: row.artist,
    side: row.side as 'A' | 'B',
    position: row.position,
    durationSeconds: row.duration_seconds ?? 0,
    audioSrc: row.audio_url ?? ''
  }))

  return {
    songs,
    cassetteName: cassette.name ?? FALLBACK_CASSETTE_NAME,
    cassetteStartDate: cassette.start_date ?? null,
    cassetteActive: cassette.active === true,
    initialSongId: songId
  }
}

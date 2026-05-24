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
 * `cassetteId` is the active cassette's UUID (null when there's no active
 * cassette and we're rendering the fallback). Used by the analytics layer
 * to scope `cassette_session_*` events.
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
  cassetteId: string | null
  cassetteStartDate: string | null
  concatAudioUrl: string | null
}> {
  const supabase = await createClient()

  // 1. Find the active cassette
  const { data: cassette } = await supabase
    .from('cassettes')
    .select('id, name, start_date, concat_audio_url, song_offsets')
    .eq('active', true)
    .single()

  if (!cassette) {
    return {
      songs: FALLBACK_SONGS,
      cassetteName: FALLBACK_CASSETTE_NAME,
      cassetteId: null,
      cassetteStartDate: null,
      concatAudioUrl: null
    }
  }

  // 2. Fetch songs ordered by side + position
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
      cassetteId: cassette.id,
      cassetteStartDate: cassette.start_date ?? null,
      concatAudioUrl: null
    }
  }

  // 3. If the cassette was processed, index offsets by song_id for cheap lookup.
  //    We only honour the concatenated URL when offsets cover every song —
  //    a partial / stale offsets table would corrupt navigation, so we
  //    silently fall back to legacy N-file mode in that case.
  const rawOffsets = (cassette.song_offsets as SongOffset[] | null) ?? null
  const offsetBySongId = new Map<string, SongOffset>()
  if (rawOffsets) {
    for (const o of rawOffsets) offsetBySongId.set(o.song_id, o)
  }
  const offsetsCoverAllSongs = rawOffsets !== null && rows.every(r => offsetBySongId.has(r.id))
  const concatAudioUrl =
    cassette.concat_audio_url && offsetsCoverAllSongs ? (cassette.concat_audio_url as string) : null

  // 4. Map DB rows → PlayerSong, attaching offsets when concat mode is active.
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
    cassetteId: cassette.id,
    cassetteStartDate: cassette.start_date ?? null,
    concatAudioUrl
  }
}

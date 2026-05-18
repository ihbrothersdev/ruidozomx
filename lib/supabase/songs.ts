import type { PlayerSong } from '@/lib/types'
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
 */
export async function getActiveCassetteSongs(): Promise<{
  songs: PlayerSong[]
  cassetteName: string
  cassetteStartDate: string | null
}> {
  const supabase = await createClient()

  // 1. Find the active cassette
  const { data: cassette } = await supabase
    .from('cassettes')
    .select('id, name, start_date')
    .eq('active', true)
    .single()

  if (!cassette) {
    return { songs: FALLBACK_SONGS, cassetteName: FALLBACK_CASSETTE_NAME, cassetteStartDate: null }
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
      cassetteStartDate: cassette.start_date ?? null
    }
  }

  // 3. Map DB rows → PlayerSong
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
    cassetteStartDate: cassette.start_date ?? null
  }
}

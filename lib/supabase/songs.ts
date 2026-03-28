import type { PlayerSong } from '@/lib/types'
import { createClient } from './server'

/**
 * Fetch songs from the active cassette.
 * Maps DB `songs` rows → `PlayerSong` for the audio player.
 * Returns { songs, cassetteName } or empty if no active cassette.
 */
export async function getActiveCassetteSongs(): Promise<{
  songs: PlayerSong[]
  cassetteName: string | null
}> {
  const supabase = await createClient()

  // 1. Find the active cassette
  const { data: cassette } = await supabase.from('cassettes').select('id, name').eq('active', true).single()

  if (!cassette) {
    return { songs: [], cassetteName: null }
  }

  // 2. Fetch songs ordered by side + position
  const { data: rows } = await supabase
    .from('songs')
    .select('id, title, artist, duration_seconds, side, position, audio_url')
    .eq('cassette_id', cassette.id)
    .order('side', { ascending: true })
    .order('position', { ascending: true })

  if (!rows || rows.length === 0) {
    return { songs: [], cassetteName: cassette.name }
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

  return { songs, cassetteName: cassette.name }
}

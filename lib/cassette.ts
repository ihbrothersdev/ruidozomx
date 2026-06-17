/**
 * Cassette concat-audio helpers shared between the admin UI and server actions.
 *
 * The home player streams one concatenated MP3 (built by `npm run build-cassette`).
 * `song_offsets` is the per-song slice table, stored in the exact order the songs
 * were spliced: side A ascending by position, then side B ascending. A cassette is
 * only publishable when that file exists AND its offsets still match the current
 * track layout — both the set of songs and their order. Reordering songs (or
 * adding/removing one) desyncs the offsets, so the cassette must be rebuilt before
 * it can go live.
 */

export type SongOffset = { song_id: string }

type OrderedSong = { id: string; side: 'A' | 'B'; position: number }

/** The canonical concatenation order: side A by position, then side B by position. */
function concatOrder(a: OrderedSong, b: OrderedSong): number {
  if (a.side !== b.side) return a.side < b.side ? -1 : 1
  return a.position - b.position
}

/**
 * True when the concatenated audio exists and its `song_offsets` cover every song
 * in the current order. Returns false if the file is missing, the cassette is
 * empty, or the offsets are stale (a song was added, removed, or reordered).
 */
export function isCassetteConcatReady(
  concatAudioUrl: string | null | undefined,
  songOffsets: SongOffset[] | null | undefined,
  songs: OrderedSong[]
): boolean {
  if (!concatAudioUrl) return false
  if (songs.length === 0) return false

  const offsets = songOffsets ?? []
  if (offsets.length !== songs.length) return false

  const expected = [...songs].sort(concatOrder)
  return expected.every((song, i) => offsets[i]?.song_id === song.id)
}

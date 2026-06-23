/**
 * Audio URL helpers shared between admin UI and server actions.
 *
 * The home player downloads the `audio_url` as a blob and plays it via the
 * HTMLAudioElement, so URLs that point to Spotify, YouTube, Apple Music,
 * SoundCloud embeds, etc. are NOT playable — they only work as references the
 * admin uses to evaluate a proposal before sourcing the real MP3.
 */

export const SONGS_BUCKET = 'songs'
export const MAX_AUDIO_BYTES = 30 * 1024 * 1024 // 30 MB
// Real .mp3 files report `audio/mpeg` in browsers; keep `audio/mp3` for the
// few user agents that use it.
export const ALLOWED_AUDIO_MIME = new Set(['audio/mpeg', 'audio/mp3'])

/** Validates client-reported audio metadata before minting a signed upload URL. */
export function audioMetaError(fileName: string, fileType: string, fileSize: number): string | null {
  if (!fileName) return 'faltan_datos'
  if (!Number.isFinite(fileSize) || fileSize <= 0) return 'archivo_vacio'
  if (fileSize > MAX_AUDIO_BYTES) return 'archivo_muy_grande'
  if (fileType && !ALLOWED_AUDIO_MIME.has(fileType)) return 'tipo_no_soportado'
  return null
}

const PLAYABLE_EXTS = /\.(mp3|m4a|wav|ogg|aac|flac)(\?|#|$)/i

const NON_PLAYABLE_HOSTS = [
  'open.spotify.com',
  'spotify.com',
  'youtube.com',
  'youtu.be',
  'music.apple.com',
  'soundcloud.com',
  'bandcamp.com',
  'tidal.com',
  'deezer.com',
  'drive.google.com',
  'docs.google.com',
  'dropbox.com',
  'wetransfer.com',
  'we.tl'
]

/** Returns true if the URL looks like a directly streamable audio file. */
export function isPlayableAudio(url: string | null | undefined): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (!trimmed) return false

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return false
  }

  const host = parsed.host.toLowerCase()
  if (NON_PLAYABLE_HOSTS.some(h => host === h || host.endsWith(`.${h}`))) {
    return false
  }

  return PLAYABLE_EXTS.test(parsed.pathname)
}

/**
 * Slug helper used to build clean storage keys from artist/title pairs.
 * Removes accents, lowercases, and collapses non-alphanumerics into `-`.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Storage key inside the `songs` bucket for a track of a cassette. */
export function songStorageKey(opts: { cassetteId: string; artist: string; title: string; ext: string }): string {
  const safeExt = opts.ext.replace(/^\./, '').toLowerCase() || 'mp3'
  return `${opts.cassetteId}/${slugify(opts.artist)}-${slugify(opts.title)}.${safeExt}`
}

/**
 * Storage key inside the `songs` bucket for a proposal's MP3. Proposals have no
 * cassette yet, so they live under a per-user `proposals/` prefix. The `rand`
 * suffix keeps re-uploads of the same title from clobbering each other.
 */
export function proposalStorageKey(opts: {
  userId: string
  artist: string
  title: string
  ext: string
  rand: string
}): string {
  const safeExt = opts.ext.replace(/^\./, '').toLowerCase() || 'mp3'
  return `proposals/${opts.userId}/${slugify(opts.artist)}-${slugify(opts.title)}-${opts.rand}.${safeExt}`
}

/**
 * Extracts the storage key (relative to the bucket) from a Supabase Storage
 * public URL. Returns null if the URL doesn't point to the given bucket.
 *
 * Examples (bucket = "songs"):
 *   ".../public/songs/CLOTHING_ToxicoSaico.mp3" → "CLOTHING_ToxicoSaico.mp3"
 *   ".../public/songs/abc-123/foo-bar.mp3"      → "abc-123/foo-bar.mp3"
 */
export function extractStorageKey(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = parsed.pathname.indexOf(marker)
  if (idx === -1) return null
  const key = parsed.pathname.slice(idx + marker.length)
  if (!key) return null
  try {
    return decodeURIComponent(key)
  } catch {
    return key
  }
}

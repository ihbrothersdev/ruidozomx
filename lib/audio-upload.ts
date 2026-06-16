import { createClient } from '@/lib/supabase/client'

const SONGS_BUCKET = 'songs'

/**
 * Upload an audio file straight to the `songs` bucket from the browser using a
 * signed upload URL minted server-side. This bypasses the Server Action body
 * limit (5mb) that a 30 MB MP3 would otherwise hit.
 */
export async function uploadAudioToSignedUrl(
  key: string,
  token: string,
  file: File
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(SONGS_BUCKET).uploadToSignedUrl(key, token, file, {
    contentType: file.type || 'audio/mpeg'
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

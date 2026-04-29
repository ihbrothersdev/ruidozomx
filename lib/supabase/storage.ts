/**
 * Converts a Supabase Storage public URL to use the image transformation API,
 * reducing file size served from the CDN (lowers Cached Egress).
 *
 * Only transforms URLs that belong to this project's Supabase instance.
 * Passes through external URLs (Spotify, SoundCloud, etc.) unchanged.
 */
export function getAvatarUrl(url: string | null | undefined, size: number): string | null {
  if (!url) return null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || !url.startsWith(supabaseUrl)) return url

  const transformed = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )

  const separator = transformed.includes('?') ? '&' : '?'
  return `${transformed}${separator}width=${size}&height=${size}&quality=75&resize=cover`
}

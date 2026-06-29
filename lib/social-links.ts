/** Canonical profile-URL builders for handle-based platforms. */
const HANDLE_URL: Record<string, (handle: string) => string> = {
  instagram: h => `https://instagram.com/${h}`,
  tiktok: h => `https://tiktok.com/@${h}`,
  twitter: h => `https://x.com/${h}`,
  facebook: h => `https://facebook.com/${h}`,
  youtube: h => `https://youtube.com/@${h}`
}

const KNOWN_DOMAINS = [
  'instagram.com',
  'tiktok.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'fb.com',
  'youtube.com',
  'youtu.be'
]

/** Turn a stored/entered social value into a working URL. Handles full URLs,
 * bare domains, and bare handles (with or without a leading @) for known
 * platforms. A "host" with no dot or a leading @ (e.g. "https://velfragor",
 * "https://@handle") isn't a real domain — it's a handle that lost its platform
 * URL, so rebuild it instead of trusting the scheme. */
export function buildLinkHref(platform: string, raw: string): string {
  const value = raw.trim()
  const builder = HANDLE_URL[platform]

  const host = value.replace(/^https?:\/\//i, '').split(/[/?#]/)[0]
  if (builder && (host.startsWith('@') || !host.includes('.'))) {
    return builder(host.replace(/^@+/, ''))
  }

  if (/^https?:\/\//i.test(value)) return value

  if (builder) {
    const lower = value.toLowerCase()
    const looksLikeUrl = value.includes('/') || KNOWN_DOMAINS.some(d => lower.includes(d))
    if (!looksLikeUrl) return builder(value.replace(/^@+/, ''))
  }

  return `https://${value}`
}

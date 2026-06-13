'use client'

import { Input } from '@/app/components/ui/input'
import { PlatformIcon } from '@/app/components/ui/platform-icon'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import type { Role } from '@/lib/types'

interface LinksSectionProps {
  socialLinks: Record<string, string> | null
  contact: string | null
  role?: Role | null
  editing?: boolean
  /** 'public' = dashed black box (public profile); 'private' = red-folder box. */
  variant?: 'public' | 'private'
  onSocialLinksChange?: (next: Record<string, string>) => void
  onContactChange?: (next: string) => void
}

const PLATFORM_LABELS: Record<string, string> = {
  web: 'Web',
  project: 'Proyecto',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp',
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  twitter: 'Twitter / X',
  maps: 'Maps'
}

/** Display order — JSONB doesn't preserve insertion order on retrieval. */
const PLATFORM_ORDER = Object.keys(PLATFORM_LABELS)

function getPlatformLabel(platform: string): string {
  return PLATFORM_LABELS[platform] ?? platform
}

/** Build the proper profile URL for a handle-based platform. */
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

/** Turn a stored social value into a working href. Handles full URLs, bare
 * domains, and bare handles (with or without a leading @) for known platforms. */
function buildLinkHref(platform: string, raw: string): string {
  const value = raw.trim()
  if (/^https?:\/\//i.test(value)) return value

  const builder = HANDLE_URL[platform]
  if (builder) {
    const lower = value.toLowerCase()
    const looksLikeUrl = value.includes('/') || KNOWN_DOMAINS.some(d => lower.includes(d))
    if (!looksLikeUrl) return builder(value.replace(/^@+/, ''))
  }

  return `https://${value}`
}

function sortLinks(socialLinks: Record<string, string>): [string, string][] {
  return Object.entries(socialLinks).sort(([a], [b]) => {
    const ai = PLATFORM_ORDER.indexOf(a)
    const bi = PLATFORM_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

const inputCls =
  'h-auto w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-1.5 font-pt-mono text-sm text-black shadow-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'

const selectTriggerCls =
  'h-auto w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-1.5 font-pt-mono text-sm text-black shadow-none focus:border-red-800 focus:ring-0'

export default function LinksSection({
  socialLinks,
  contact,
  editing = false,
  variant = 'public',
  onSocialLinksChange,
  onContactChange
}: LinksSectionProps) {
  if (editing) {
    return (
      <EditingView
        socialLinks={socialLinks ?? {}}
        contact={contact ?? ''}
        variant={variant}
        onSocialLinksChange={onSocialLinksChange ?? (() => {})}
        onContactChange={onContactChange ?? (() => {})}
      />
    )
  }

  const sortedLinks = socialLinks ? sortLinks(socialLinks) : []
  const hasSocialLinks = sortedLinks.length > 0
  const hasAnyContent = hasSocialLinks || contact

  if (!hasAnyContent) return null

  // Private variant matches the red-folder dashboard (red label + red box);
  // public keeps the dashed-black card used on the public profile.
  if (variant === 'private') {
    return (
      <div className='w-full space-y-1'>
        <p className='font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'>Links</p>
        <div className='space-y-1 border-2 border-red-700 px-3 py-2'>
          {sortedLinks.map(([platform, url]) => (
            <a
              key={platform}
              href={buildLinkHref(platform, url)}
              target='_blank'
              rel='noopener noreferrer'
              className='font-pt-mono flex items-center gap-2 text-sm text-black transition-colors hover:text-red-700'
            >
              <PlatformIcon
                platform={platform}
                className='size-4 shrink-0'
              />
              <span className='underline decoration-red-700/50 underline-offset-2'>{getPlatformLabel(platform)}</span>
            </a>
          ))}

          {contact && <p className='font-pt-mono text-sm text-black'>Contacto: {contact}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className='border border-dashed border-black/20 p-4'>
      <h4 className='font-pt-mono text-lg font-bold tracking-wider text-black uppercase'>Links</h4>
      <div className='mt-2 space-y-1'>
        {sortedLinks.map(([platform, url]) => (
          <a
            key={platform}
            href={buildLinkHref(platform, url)}
            target='_blank'
            rel='noopener noreferrer'
            className='font-pt-mono flex items-center gap-2 text-sm text-black/70 hover:text-black'
          >
            <PlatformIcon
              platform={platform}
              className='size-4 shrink-0'
            />
            <span className='underline'>{getPlatformLabel(platform)}</span>
          </a>
        ))}

        {contact && <p className='font-pt-mono text-sm text-black/70'>Contacto: {contact}</p>}
      </div>
    </div>
  )
}

interface EditingViewProps {
  socialLinks: Record<string, string>
  contact: string
  variant?: 'public' | 'private'
  onSocialLinksChange: (next: Record<string, string>) => void
  onContactChange: (next: string) => void
}

function EditingView({
  socialLinks,
  contact,
  variant = 'public',
  onSocialLinksChange,
  onContactChange
}: EditingViewProps) {
  const rows = sortLinks(socialLinks)
  const usedPlatforms = new Set(rows.map(([p]) => p))
  const available = PLATFORM_ORDER.filter(p => !usedPlatforms.has(p))
  const canAdd = available.length > 0

  const isPrivate = variant === 'private'
  // On-brand but desaturated: keep the red look (labels, hints of red) without
  // the heavy full-red borders everywhere — soft panel with a faint red wash,
  // thin low-opacity red borders, and a stronger red only on focus.
  const containerCls = isPrivate ? '' : 'border border-dashed border-black/20 p-4'
  const headingCls = isPrivate
    ? 'font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'
    : 'font-pt-mono text-lg font-bold tracking-wider text-black uppercase'
  const cardCls = isPrivate ? 'bg-red-700/[0.035]' : 'border border-black/10 bg-black/[0.02]'
  const labelCls = isPrivate
    ? 'font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'
    : 'font-pt-mono text-[11px] font-bold tracking-wider text-black/60 uppercase'
  const inputClsV = isPrivate
    ? 'h-auto w-full rounded-md border border-red-700/30 bg-transparent px-3 py-2 font-pt-mono text-sm text-black shadow-none placeholder:text-black/30 focus-visible:border-red-700/70 focus-visible:ring-0'
    : inputCls
  const selectClsV = isPrivate
    ? 'h-auto w-full rounded-md border border-red-700/30 bg-transparent px-3 py-2 font-pt-mono text-sm text-black shadow-none focus:border-red-700/70 focus:ring-0'
    : selectTriggerCls
  const removeBtnCls = isPrivate
    ? 'text-red-600/60 hover:bg-red-600/10 hover:text-red-700'
    : 'border-2 border-red-600 text-red-700 hover:bg-red-600 hover:text-white'

  function updatePlatform(prevPlatform: string, nextPlatform: string) {
    if (prevPlatform === nextPlatform) return
    const next: Record<string, string> = {}
    for (const [p, url] of rows) {
      next[p === prevPlatform ? nextPlatform : p] = url
    }
    onSocialLinksChange(next)
  }

  function updateUrl(platform: string, url: string) {
    const next = { ...socialLinks }
    next[platform] = url
    onSocialLinksChange(next)
  }

  function remove(platform: string) {
    const next = { ...socialLinks }
    delete next[platform]
    onSocialLinksChange(next)
  }

  function add() {
    if (!canAdd) return
    const nextPlatform = available[0]
    onSocialLinksChange({ ...socialLinks, [nextPlatform]: '' })
  }

  return (
    <div className={containerCls}>
      <h4 className={headingCls}>Links</h4>

      <div className='mt-3 space-y-3'>
        {rows.length === 0 && (
          <p className='font-pt-mono text-xs text-black/40 italic'>Aún no has agregado ningún enlace.</p>
        )}

        {/* Each link is one soft panel: platform + remove on the top row (so the
            chevron and the × line up), URL input full-width below. */}
        {rows.map(([platform, url]) => (
          <div
            key={platform}
            className={`space-y-2 rounded-lg p-3 ${cardCls}`}
          >
            <div className='flex items-center gap-2'>
              <div className='min-w-0 flex-1'>
                <Select
                  value={platform}
                  onValueChange={v => updatePlatform(platform, v)}
                >
                  <SelectTrigger className={selectClsV}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_ORDER.map(p => (
                      <SelectItem
                        key={p}
                        value={p}
                        disabled={p !== platform && usedPlatforms.has(p)}
                      >
                        <PlatformIcon
                          platform={p}
                          className='size-4'
                        />
                        {getPlatformLabel(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                type='button'
                onClick={() => remove(platform)}
                aria-label='Quitar enlace'
                className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-lg leading-none transition-colors ${removeBtnCls}`}
              >
                ×
              </button>
            </div>

            <Input
              type='url'
              value={url}
              onChange={e => updateUrl(platform, e.target.value)}
              placeholder='https://…'
              className={inputClsV}
            />
          </div>
        ))}
      </div>

      {canAdd && (
        <button
          type='button'
          onClick={add}
          className='font-pt-mono mt-3 cursor-pointer text-xs font-bold tracking-wider text-red-700/90 uppercase transition-colors hover:text-red-800'
        >
          + Agregar otra
        </button>
      )}

      <div className='mt-4 space-y-1'>
        <p className={labelCls}>Contacto público</p>
        <Input
          value={contact}
          onChange={e => onContactChange(e.target.value)}
          placeholder='Email, teléfono o handle'
          className={inputClsV}
        />
      </div>
    </div>
  )
}

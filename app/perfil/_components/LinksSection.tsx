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
  onSocialLinksChange,
  onContactChange
}: LinksSectionProps) {
  if (editing) {
    return (
      <EditingView
        socialLinks={socialLinks ?? {}}
        contact={contact ?? ''}
        onSocialLinksChange={onSocialLinksChange ?? (() => {})}
        onContactChange={onContactChange ?? (() => {})}
      />
    )
  }

  const sortedLinks = socialLinks ? sortLinks(socialLinks) : []
  const hasSocialLinks = sortedLinks.length > 0
  const hasAnyContent = hasSocialLinks || contact

  if (!hasAnyContent) return null

  return (
    <div className='border border-dashed border-black/20 p-4'>
      <h4 className='font-pt-mono text-lg font-bold tracking-wider text-black uppercase'>Links</h4>
      <div className='mt-2 space-y-1'>
        {sortedLinks.map(([platform, url]) => (
          <a
            key={platform}
            href={url.startsWith('http') ? url : `https://${url}`}
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

// ── Edit mode ──────────────────────────────────────────────────────────

interface EditingViewProps {
  socialLinks: Record<string, string>
  contact: string
  onSocialLinksChange: (next: Record<string, string>) => void
  onContactChange: (next: string) => void
}

function EditingView({ socialLinks, contact, onSocialLinksChange, onContactChange }: EditingViewProps) {
  const rows = sortLinks(socialLinks)
  const usedPlatforms = new Set(rows.map(([p]) => p))
  const available = PLATFORM_ORDER.filter(p => !usedPlatforms.has(p))
  const canAdd = available.length > 0

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
    <div className='border border-dashed border-black/20 p-4'>
      <h4 className='font-pt-mono text-lg font-bold tracking-wider text-black uppercase'>Links</h4>

      <div className='mt-3 space-y-2'>
        {rows.length === 0 && (
          <p className='font-pt-mono text-xs text-black/40 italic'>Aún no has agregado ningún enlace.</p>
        )}

        {rows.map(([platform, url]) => (
          <div
            key={platform}
            className='flex flex-col gap-2 sm:flex-row sm:items-stretch'
          >
            <div className='w-full sm:w-44 sm:shrink-0'>
              <Select
                value={platform}
                onValueChange={v => updatePlatform(platform, v)}
              >
                <SelectTrigger className={selectTriggerCls}>
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

            <div className='flex items-stretch gap-2 sm:flex-1'>
              <div className='min-w-0 flex-1'>
                <Input
                  type='url'
                  value={url}
                  onChange={e => updateUrl(platform, e.target.value)}
                  placeholder='https://…'
                  className={inputCls}
                />
              </div>

              <button
                type='button'
                onClick={() => remove(platform)}
                aria-label='Quitar enlace'
                className='font-pt-mono shrink-0 cursor-pointer px-2 text-lg leading-none text-red-700 transition-colors hover:text-red-900'
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {canAdd && (
        <button
          type='button'
          onClick={add}
          className='font-pt-mono mt-2 cursor-pointer text-xs font-bold tracking-wider text-red-700 uppercase transition-colors hover:text-red-900'
        >
          + Agregar otra
        </button>
      )}

      <div className='mt-4 space-y-1'>
        <p className='font-pt-mono text-[11px] font-bold tracking-wider text-black/60 uppercase'>Contacto público</p>
        <Input
          value={contact}
          onChange={e => onContactChange(e.target.value)}
          placeholder='Email, teléfono o handle'
          className={inputCls}
        />
      </div>
    </div>
  )
}

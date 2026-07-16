'use client'

import { Paper } from '@/app/admin/_components/kit'
import { Input } from '@/app/components/ui/input'
import { PlatformIcon } from '@/app/components/ui/platform-icon'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { buildLinkHref } from '@/lib/social-links'
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
  'h-auto w-full rounded-none border-2 border-admin-ink bg-admin-paper px-3 py-1.5 font-pt-mono text-sm text-admin-ink shadow-none placeholder:text-admin-ink-faint focus-visible:border-admin-red focus-visible:ring-0'

const selectTriggerCls =
  'h-auto w-full rounded-none border-2 border-admin-ink bg-admin-paper px-3 py-1.5 font-pt-mono text-sm text-admin-ink shadow-none focus:border-admin-red focus:ring-0'

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

  // Private variant matches the red-folder dashboard (red label + red-edged
  // Paper); public keeps a flat printed card used on the public profile.
  if (variant === 'private') {
    return (
      <div className='w-full space-y-1'>
        <p className='font-pt-mono text-admin-red text-sm font-bold tracking-wider uppercase'>Links</p>
        <Paper
          tone='red'
          className='space-y-1 px-3 py-2'
        >
          {sortedLinks.map(([platform, url]) => (
            <a
              key={platform}
              href={buildLinkHref(platform, url)}
              target='_blank'
              rel='noopener noreferrer'
              className='font-pt-mono text-admin-ink hover:text-admin-red flex items-center gap-2 text-sm transition-colors'
            >
              <PlatformIcon
                platform={platform}
                className='size-4 shrink-0'
              />
              <span className='decoration-admin-red/50 underline underline-offset-2'>
                {getPlatformLabel(platform)}
              </span>
            </a>
          ))}

          {contact && <p className='font-pt-mono text-admin-ink text-sm'>Contacto: {contact}</p>}
        </Paper>
      </div>
    )
  }

  return (
    <Paper
      flat
      className='p-4'
    >
      <h4 className='font-pt-mono text-admin-ink text-lg font-bold tracking-wider uppercase'>Links</h4>
      <div className='mt-2 space-y-1'>
        {sortedLinks.map(([platform, url]) => (
          <a
            key={platform}
            href={buildLinkHref(platform, url)}
            target='_blank'
            rel='noopener noreferrer'
            className='font-pt-mono text-admin-ink-soft hover:text-admin-ink flex items-center gap-2 text-sm'
          >
            <PlatformIcon
              platform={platform}
              className='size-4 shrink-0'
            />
            <span className='underline'>{getPlatformLabel(platform)}</span>
          </a>
        ))}

        {contact && <p className='font-pt-mono text-admin-ink-soft text-sm'>Contacto: {contact}</p>}
      </div>
    </Paper>
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
  const containerCls = isPrivate ? '' : 'border-admin-ink/25 border-2 border-dashed p-4'
  const headingCls = isPrivate
    ? 'font-pt-mono text-admin-red text-sm font-bold tracking-wider uppercase'
    : 'font-pt-mono text-admin-ink text-lg font-bold tracking-wider uppercase'
  const cardCls = isPrivate
    ? 'border-admin-red/20 border-2 bg-admin-red/[0.04]'
    : 'border-admin-ink/15 border-2 bg-admin-ink/[0.03]'
  const labelCls = isPrivate
    ? 'font-pt-mono text-admin-red text-sm font-bold tracking-wider uppercase'
    : 'font-pt-mono text-admin-ink-soft text-[11px] font-bold tracking-wider uppercase'
  const removeBtnCls = isPrivate
    ? 'text-admin-red/60 hover:bg-admin-red/10 hover:text-admin-red'
    : 'border-admin-ink text-admin-red hover:bg-admin-red hover:text-admin-surface border-2'

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
          <p className='font-pt-mono text-admin-ink-faint text-xs italic'>Aún no has agregado ningún enlace.</p>
        )}

        {/* Each link is one panel: platform + remove on the top row (so the
            chevron and the × line up), URL input full-width below. */}
        {rows.map(([platform, url]) => (
          <div
            key={platform}
            className={`space-y-2 p-3 ${cardCls}`}
          >
            <div className='flex items-center gap-2'>
              <div className='min-w-0 flex-1'>
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

              <button
                type='button'
                onClick={() => remove(platform)}
                aria-label='Quitar enlace'
                className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-lg leading-none transition-colors ${removeBtnCls}`}
              >
                ×
              </button>
            </div>

            <Input
              type='url'
              value={url}
              onChange={e => updateUrl(platform, e.target.value)}
              placeholder='https://…'
              className={inputCls}
            />
          </div>
        ))}
      </div>

      {canAdd && (
        <button
          type='button'
          onClick={add}
          className='font-pt-mono text-admin-red hover:text-admin-red mt-3 cursor-pointer text-xs font-bold tracking-wider uppercase transition-colors'
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
          className={inputCls}
        />
      </div>
    </div>
  )
}

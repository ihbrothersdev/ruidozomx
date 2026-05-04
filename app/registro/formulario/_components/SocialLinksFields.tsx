'use client'

import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { PlatformIcon } from '@/app/components/ui/platform-icon'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { useState } from 'react'
import { inputCls, labelCls, selectTriggerCls } from './form-styles'

const PLATFORM_OPTIONS = [
  { value: 'web', label: 'Web' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter / X' }
] as const

type PlatformValue = (typeof PLATFORM_OPTIONS)[number]['value']

const PLATFORM_PLACEHOLDERS: Record<PlatformValue, string> = {
  web: 'https://tubanda.com',
  instagram: 'https://instagram.com/tubanda',
  facebook: 'https://facebook.com/tubanda',
  tiktok: 'https://tiktok.com/@tubanda',
  youtube: 'https://youtube.com/@tubanda',
  twitter: 'https://x.com/tubanda'
}

interface Row {
  id: string
  platform: PlatformValue
  url: string
}

function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `r-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`
}

interface SocialLinksFieldsProps {
  label?: string
  initialPlatform?: PlatformValue
}

export function SocialLinksFields({ label = 'Web y redes sociales', initialPlatform = 'web' }: SocialLinksFieldsProps) {
  const [rows, setRows] = useState<Row[]>(() => [{ id: uid(), platform: initialPlatform, url: '' }])

  const usedPlatforms = new Set(rows.map(r => r.platform))
  const canAdd = rows.length < PLATFORM_OPTIONS.length

  function update(id: string, patch: Partial<Row>) {
    setRows(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)))
  }

  function remove(id: string) {
    setRows(rs => (rs.length === 1 ? rs : rs.filter(r => r.id !== id)))
  }

  function add() {
    if (!canAdd) return
    const next = PLATFORM_OPTIONS.find(p => !usedPlatforms.has(p.value))
    if (!next) return
    setRows(rs => [...rs, { id: uid(), platform: next.value, url: '' }])
  }

  return (
    <div className='space-y-1.5'>
      <Label className={labelCls}>{label}</Label>

      <div className='space-y-1.5'>
        {rows.map(row => (
          <div
            key={row.id}
            className='flex items-stretch gap-2'
          >
            <div className='w-40 shrink-0 sm:w-44'>
              <Select
                value={row.platform}
                onValueChange={v => update(row.id, { platform: v as PlatformValue })}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map(opt => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.value !== row.platform && usedPlatforms.has(opt.value)}
                    >
                      <PlatformIcon
                        platform={opt.value}
                        className='size-4'
                      />
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 flex-1'>
              <Input
                type='url'
                name={`social_${row.platform}`}
                value={row.url}
                onChange={e => update(row.id, { url: e.target.value })}
                placeholder={PLATFORM_PLACEHOLDERS[row.platform]}
                className={inputCls}
              />
            </div>

            {rows.length > 1 && (
              <button
                type='button'
                onClick={() => remove(row.id)}
                aria-label='Quitar enlace'
                className='font-pt-mono shrink-0 cursor-pointer px-2 text-lg leading-none text-red-700 transition-colors hover:text-red-900'
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {canAdd && (
        <button
          type='button'
          onClick={add}
          className='font-pt-mono cursor-pointer text-xs font-bold tracking-wider text-red-700 uppercase transition-colors hover:text-red-900'
        >
          + Agregar otra
        </button>
      )}
    </div>
  )
}

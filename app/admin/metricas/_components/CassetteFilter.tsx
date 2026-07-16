'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export type CassetteOption = {
  id: string
  name: string
  state: 'active' | 'next' | 'archived' | 'draft'
}

const STATE_LABEL: Record<CassetteOption['state'], string> = {
  active: '🟢',
  next: '🟡',
  archived: '⚪',
  draft: '⚫'
}

export function CassetteFilter({ options, selected }: { options: CassetteOption[]; selected: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [pending, start] = useTransition()

  function onChange(value: string) {
    const next = new URLSearchParams(sp.toString())
    if (value === 'all') next.delete('cassette')
    else next.set('cassette', value)
    const qs = next.toString()
    start(() => router.replace(`/admin/metricas${qs ? `?${qs}` : ''}`, { scroll: false }))
  }

  return (
    <div className='flex w-full items-center gap-2 sm:w-auto'>
      <span className='font-pt-mono text-admin-ink-soft shrink-0 text-[10px] tracking-[0.25em] uppercase'>Cassette</span>
      <Select
        value={selected}
        onValueChange={onChange}
        disabled={pending}
      >
        <SelectTrigger className='font-pt-mono border-admin-ink bg-admin-paper text-admin-ink h-8 min-w-0 flex-1 border-2 text-xs sm:w-[220px] sm:flex-none'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='border-admin-ink bg-admin-surface text-admin-ink border-2'>
          <SelectItem value='all'>Todos los cassettes</SelectItem>
          {options.map(o => (
            <SelectItem
              key={o.id}
              value={o.id}
            >
              <span className='mr-2'>{STATE_LABEL[o.state]}</span>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

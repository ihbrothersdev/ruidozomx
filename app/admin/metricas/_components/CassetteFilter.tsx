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
    <div className='flex items-center gap-2'>
      <span className='font-pt-mono text-[10px] tracking-[0.25em] text-white/40 uppercase'>Cassette</span>
      <Select
        value={selected}
        onValueChange={onChange}
        disabled={pending}
      >
        <SelectTrigger className='font-pt-mono h-8 w-[220px] border-white/10 bg-white/3 text-xs text-white'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='border-white/10 bg-neutral-900 text-white'>
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

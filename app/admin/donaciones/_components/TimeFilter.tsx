'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

const OPTIONS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: 'all', label: 'Todo' }
] as const

export type TimeWindow = (typeof OPTIONS)[number]['value']

export function TimeFilter({ selected }: { selected: TimeWindow }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [pending, start] = useTransition()

  function onClick(value: TimeWindow) {
    if (value === selected) return
    const next = new URLSearchParams(sp.toString())
    if (value === 'all') next.delete('since')
    else next.set('since', value)
    const qs = next.toString()
    start(() => router.replace(`/admin/donaciones${qs ? `?${qs}` : ''}`, { scroll: false }))
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='font-pt-mono text-admin-ink-soft text-[10px] tracking-[0.25em] uppercase'>Rango</span>
      <div
        role='radiogroup'
        className={`flex items-center gap-1.5 ${pending ? 'opacity-60' : ''}`}
      >
        {OPTIONS.map(o => (
          <button
            key={o.value}
            type='button'
            role='radio'
            aria-checked={selected === o.value}
            onClick={() => onClick(o.value)}
            disabled={pending}
            className={`font-pt-mono cursor-pointer border-2 border-admin-ink px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors ${
              selected === o.value
                ? 'bg-admin-red text-admin-surface admin-hard-sm'
                : 'bg-admin-surface text-admin-ink hover:bg-admin-paper-deep'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

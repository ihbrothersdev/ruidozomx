'use client'

import { cn } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

type Filter = 'all' | 'pending' | 'accepted' | 'rejected'

interface FilterTabsProps {
  counts: Record<Filter, number>
}

const TABS: { id: Filter; label: string }[] = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'accepted', label: 'Aceptadas' },
  { id: 'rejected', label: 'Rechazadas' },
  { id: 'all', label: 'Todas' }
]

export function FilterTabs({ counts }: FilterTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()
  const current = (params.get('f') as Filter) || 'pending'

  function changeTab(id: Filter) {
    const sp = new URLSearchParams(params.toString())
    sp.delete('page')
    if (id === 'pending') sp.delete('f')
    else sp.set('f', id)
    const qs = sp.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname))
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {TABS.map(t => {
        const isActive = current === t.id
        return (
          <button
            key={t.id}
            type='button'
            onClick={() => changeTab(t.id)}
            aria-pressed={isActive}
            className={cn(
              'font-pt-mono border-admin-ink inline-flex items-center gap-2 border-2 px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors',
              isActive
                ? 'admin-hard-sm bg-admin-red text-admin-surface'
                : 'bg-admin-surface text-admin-ink hover:bg-admin-paper-deep'
            )}
          >
            {t.label}
            <span
              className={cn(
                'px-1.5 py-0.5 text-[10px] leading-none tracking-normal tabular-nums',
                isActive ? 'bg-admin-surface/20 text-admin-surface' : 'bg-admin-ink/10 text-admin-ink-soft'
              )}
            >
              {counts[t.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

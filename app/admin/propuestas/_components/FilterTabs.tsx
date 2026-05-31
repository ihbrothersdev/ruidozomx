'use client'

import { Badge } from '@/app/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

type Filter = 'all' | 'pending' | 'accepted' | 'rejected'

interface FilterTabsProps {
  counts: Record<Filter, number>
}

// Each tab carries its semantic color at rest (subtle tint + colored text)
// and ramps up when active (stronger background + accent shadow underline).
// Matches the STATUS_BADGE scheme used in the proposal cards.
const TABS: {
  id: Filter
  label: string
  triggerCls: string
  badgeActive: string
  badgeIdle: string
}[] = [
  {
    id: 'pending',
    label: 'Pendientes',
    triggerCls:
      'bg-amber-500/5 text-amber-300/80 hover:bg-amber-500/10 hover:text-amber-200 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-100 data-[state=active]:shadow-[inset_0_-2px_0_0] data-[state=active]:shadow-amber-400',
    badgeActive: 'bg-amber-400/30 text-amber-100',
    badgeIdle: 'bg-amber-500/15 text-amber-300/80'
  },
  {
    id: 'accepted',
    label: 'Aceptadas',
    triggerCls:
      'bg-emerald-500/5 text-emerald-300/80 hover:bg-emerald-500/10 hover:text-emerald-200 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100 data-[state=active]:shadow-[inset_0_-2px_0_0] data-[state=active]:shadow-emerald-400',
    badgeActive: 'bg-emerald-400/30 text-emerald-100',
    badgeIdle: 'bg-emerald-500/15 text-emerald-300/80'
  },
  {
    id: 'rejected',
    label: 'Rechazadas',
    triggerCls:
      'bg-white/3 text-white/50 hover:bg-white/8 hover:text-white/80 data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-[inset_0_-2px_0_0] data-[state=active]:shadow-white/60',
    badgeActive: 'bg-white/25 text-white',
    badgeIdle: 'bg-white/10 text-white/50'
  },
  {
    id: 'all',
    label: 'Todas',
    triggerCls:
      'bg-red-500/5 text-red-300/80 hover:bg-red-500/10 hover:text-red-200 data-[state=active]:bg-red-600/25 data-[state=active]:text-red-100 data-[state=active]:shadow-[inset_0_-2px_0_0] data-[state=active]:shadow-red-500',
    badgeActive: 'bg-red-400/30 text-red-100',
    badgeIdle: 'bg-red-500/15 text-red-300/80'
  }
]

export function FilterTabs({ counts }: FilterTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()
  const current = (params.get('f') as Filter) || 'pending'

  function changeTab(id: Filter) {
    const sp = new URLSearchParams(params.toString())
    if (id === 'pending') sp.delete('f')
    else sp.set('f', id)
    const qs = sp.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname))
  }

  return (
    <Tabs
      value={current}
      onValueChange={v => changeTab(v as Filter)}
    >
      <TabsList className='h-auto gap-1 bg-transparent p-0 text-white/60'>
        {TABS.map(t => {
          const isActive = current === t.id
          return (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className={`font-pt-mono gap-2 text-[11px] font-bold tracking-wider uppercase transition-colors ${t.triggerCls}`}
            >
              {t.label}
              <Badge
                variant='secondary'
                className={`px-1.5 text-[10px] tracking-normal transition-colors ${
                  isActive ? t.badgeActive : t.badgeIdle
                }`}
              >
                {counts[t.id]}
              </Badge>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

'use client'

import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

export function SearchAndDateFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [from, setFrom] = useState(params.get('from') ?? '')
  const [to, setTo] = useState(params.get('to') ?? '')

  // Re-sync local form state when the URL params change externally (back/
  // forward, FilterTabs, etc.). The same component instance keeps focus
  // state across param changes, so a `key` reset isn't appropriate here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ(params.get('q') ?? '')
    setFrom(params.get('from') ?? '')
    setTo(params.get('to') ?? '')
  }, [params])

  function pushParams(next: { q?: string; from?: string; to?: string }) {
    const sp = new URLSearchParams(params.toString())
    sp.delete('page')
    const merged = { q, from, to, ...next }
    for (const [k, v] of Object.entries(merged)) {
      if (v && v.length > 0) sp.set(k, v)
      else sp.delete(k)
    }
    startTransition(() => router.replace(`${pathname}?${sp.toString()}`))
  }

  function clearAll() {
    setQ('')
    setFrom('')
    setTo('')
    const sp = new URLSearchParams(params.toString())
    sp.delete('page')
    sp.delete('q')
    sp.delete('from')
    sp.delete('to')
    startTransition(() => router.replace(`${pathname}?${sp.toString()}`))
  }

  const hasFilters = q || from || to

  return (
    <div className='flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/2 p-3'>
      <div className='relative min-w-[220px] flex-1'>
        <Label
          htmlFor='proposal-search'
          className='font-pt-mono mb-1 text-[10px] tracking-widest text-white/40 uppercase'
        >
          Buscar
        </Label>
        <div className='relative'>
          <Search className='pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-white/30' />
          <Input
            id='proposal-search'
            type='search'
            value={q}
            onChange={e => setQ(e.target.value)}
            onBlur={() => pushParams({ q })}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                pushParams({ q })
              }
            }}
            placeholder='Artista o título…'
            className='font-pt-mono border-white/10 bg-black/30 pl-8 text-xs text-white placeholder:text-white/25'
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor='proposal-from'
          className='font-pt-mono mb-1 text-[10px] tracking-widest text-white/40 uppercase'
        >
          Desde
        </Label>
        <Input
          id='proposal-from'
          type='date'
          value={from}
          onChange={e => {
            setFrom(e.target.value)
            pushParams({ from: e.target.value })
          }}
          className='font-pt-mono w-auto border-white/10 bg-black/30 text-xs text-white'
        />
      </div>

      <div>
        <Label
          htmlFor='proposal-to'
          className='font-pt-mono mb-1 text-[10px] tracking-widest text-white/40 uppercase'
        >
          Hasta
        </Label>
        <Input
          id='proposal-to'
          type='date'
          value={to}
          onChange={e => {
            setTo(e.target.value)
            pushParams({ to: e.target.value })
          }}
          className='font-pt-mono w-auto border-white/10 bg-black/30 text-xs text-white'
        />
      </div>

      {hasFilters && (
        <Button
          variant='outline'
          size='sm'
          onClick={clearAll}
          className='font-pt-mono border-white/10 bg-white/5 text-[10px] tracking-wider text-white/70 uppercase hover:bg-white/10 hover:text-white'
        >
          <X className='h-3 w-3' />
          Limpiar
        </Button>
      )}

      {isPending && <span className='font-pt-mono self-center text-[10px] text-white/30'>Filtrando…</span>}
    </div>
  )
}

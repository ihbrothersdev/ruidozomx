'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/** The pager ellipsis, but click it to type any page number and jump there. */
export function PageJump({ totalPages, baseQuery }: { totalPages: number; baseQuery: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  function go() {
    const n = Math.min(totalPages, Math.max(1, parseInt(value, 10) || 0))
    setEditing(false)
    setValue('')
    if (!n) return
    const sp = new URLSearchParams(baseQuery)
    if (n > 1) sp.set('page', String(n))
    const qs = sp.toString()
    router.push(qs ? `/admin/propuestas?${qs}` : '/admin/propuestas')
  }

  if (!editing) {
    return (
      <button
        type='button'
        onClick={() => setEditing(true)}
        aria-label='Ir a una página'
        title='Ir a una página'
        className='font-pt-mono flex h-8 w-6 items-center justify-center text-[11px] text-white/25 transition-colors hover:text-white/70'
      >
        …
      </button>
    )
  }

  return (
    <input
      autoFocus
      type='number'
      min={1}
      max={totalPages}
      inputMode='numeric'
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') go()
        if (e.key === 'Escape') {
          setEditing(false)
          setValue('')
        }
      }}
      onBlur={() => {
        setEditing(false)
        setValue('')
      }}
      placeholder='#'
      className='font-pt-mono h-8 w-12 [appearance:textfield] rounded border border-red-500/40 bg-white/5 text-center text-[11px] text-white outline-none [&::-webkit-inner-spin-button]:appearance-none'
    />
  )
}

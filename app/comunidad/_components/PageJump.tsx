'use client'

import { useState } from 'react'

/** The pager ellipsis, but click it to type any page number and jump there. */
export function PageJump({ totalPages, onJump }: { totalPages: number; onJump: (page: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  function close(commit: boolean) {
    const n = parseInt(value, 10)
    setEditing(false)
    setValue('')
    if (commit && Number.isFinite(n)) onJump(Math.min(totalPages, Math.max(1, n)))
  }

  if (!editing) {
    return (
      <button
        type='button'
        onClick={() => setEditing(true)}
        aria-label='Ir a una página'
        title='Ir a una página'
        className='font-pt-mono flex h-8 w-6 cursor-pointer items-center justify-center text-[11px] text-white/50 transition-colors hover:text-white'
      >
        …
      </button>
    )
  }

  // Commits on blur too: the iOS numeric keypad has no return key.
  return (
    <input
      autoFocus
      type='number'
      min={1}
      max={totalPages}
      inputMode='numeric'
      enterKeyHint='go'
      aria-label={`Ir a la página (1 a ${totalPages})`}
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') close(true)
        if (e.key === 'Escape') close(false)
      }}
      onBlur={() => close(true)}
      placeholder='#'
      className='font-pt-mono h-8 w-12 [appearance:textfield] rounded border border-white/40 bg-white/10 text-center text-[11px] text-white outline-none placeholder:text-white/40 [&::-webkit-inner-spin-button]:appearance-none'
    />
  )
}

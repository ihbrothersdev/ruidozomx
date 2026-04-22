'use client'

import { useState } from 'react'

/** Small copy-to-clipboard button used in the proposal meta row. */
export function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // no-op: some browsers/contexts block clipboard
    }
  }

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='font-pt-mono inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold text-white/70 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white'
    >
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  )
}

'use client'

import Image from 'next/image'

interface TransportButtonProps {
  offSrc: string
  onSrc: string
  alt: string
  active?: boolean
  onClick?: () => void
}

export function TransportButton({ offSrc, onSrc, alt, active, onClick }: TransportButtonProps) {
  return (
    <button
      className='group relative cursor-pointer'
      onClick={onClick}
    >
      <Image
        src={offSrc}
        alt={alt}
        width={90}
        height={84}
        className={`w-full h-auto transition-opacity group-hover:opacity-0 group-active:opacity-0 ${active ? 'opacity-0' : ''}`}
        unoptimized
      />
      <Image
        src={onSrc}
        alt={alt}
        width={90}
        height={84}
        className={`absolute inset-0 w-full h-auto opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100 ${active ? 'opacity-100' : ''}`}
        unoptimized
      />
    </button>
  )
}

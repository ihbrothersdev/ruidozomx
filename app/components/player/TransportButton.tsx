'use client'

import Image from 'next/image'

interface ButtonProps {
  active?: boolean
  onClick?: () => void
}

export function PrevButton({ onClick }: ButtonProps) {
  return (
    <button
      className='group relative cursor-pointer'
      onClick={onClick}
    >
      <Image
        src='/assets/controles/regresar-off.png'
        alt='Regresar'
        width={87}
        height={81}
        className='pointer-events-none transition-opacity group-active:opacity-0 sm:group-hover:opacity-0'
        unoptimized
      />
      <Image
        src='/assets/controles/regresar-on.png'
        alt=''
        width={87}
        height={82}
        className='pointer-events-none absolute inset-0 opacity-0 transition-opacity group-active:opacity-100 sm:group-hover:opacity-100'
        unoptimized
      />
    </button>
  )
}

export function StopButton({ active, onClick }: ButtonProps) {
  return (
    <button
      className='group relative cursor-pointer'
      onClick={onClick}
    >
      <Image
        src='/assets/controles/stop-off.png'
        alt='Stop'
        width={87}
        height={81}
        className={`pointer-events-none transition-opacity group-active:opacity-0 sm:group-hover:opacity-0 ${active ? 'opacity-0' : ''}`}
        unoptimized
      />
      <Image
        src='/assets/controles/stop-on.png'
        alt=''
        width={87}
        height={82}
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity group-active:opacity-100 sm:group-hover:opacity-100 ${active ? 'opacity-100' : ''}`}
        unoptimized
      />
    </button>
  )
}

export function PlayButton({ active, onClick }: ButtonProps) {
  return (
    <button
      className='group relative cursor-pointer'
      onClick={onClick}
    >
      <Image
        src='/assets/controles/play-off.png'
        alt='Play'
        width={87}
        height={81}
        className={`pointer-events-none transition-opacity group-active:opacity-0 sm:group-hover:opacity-0 ${active ? 'opacity-0' : ''}`}
        unoptimized
      />
      <Image
        src='/assets/controles/play-on.png'
        alt=''
        width={87}
        height={82}
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity group-active:opacity-100 sm:group-hover:opacity-100 ${active ? 'opacity-100' : ''}`}
        unoptimized
      />
    </button>
  )
}

export function PauseButton({ active, onClick }: ButtonProps) {
  return (
    <button
      className='group relative cursor-pointer'
      onClick={onClick}
    >
      <Image
        src='/assets/controles/pausa-off.png'
        alt='Pausa'
        width={87}
        height={81}
        className={`pointer-events-none transition-opacity group-active:opacity-0 sm:group-hover:opacity-0 ${active ? 'opacity-0' : ''}`}
        unoptimized
      />
      <Image
        src='/assets/controles/pausa-on.png'
        alt=''
        width={87}
        height={82}
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity group-active:opacity-100 sm:group-hover:opacity-100 ${active ? 'opacity-100' : ''}`}
        unoptimized
      />
    </button>
  )
}

export function NextButton({ onClick }: ButtonProps) {
  return (
    <button
      className='group relative cursor-pointer'
      onClick={onClick}
    >
      <Image
        src='/assets/controles/adelantar-off.png'
        alt='Adelantar'
        width={87}
        height={81}
        className='pointer-events-none transition-opacity group-active:opacity-0 sm:group-hover:opacity-0'
        unoptimized
      />
      <Image
        src='/assets/controles/adelantar-on.png'
        alt=''
        width={87}
        height={82}
        className='pointer-events-none absolute inset-0 opacity-0 transition-opacity group-active:opacity-100 sm:group-hover:opacity-100'
        unoptimized
      />
    </button>
  )
}

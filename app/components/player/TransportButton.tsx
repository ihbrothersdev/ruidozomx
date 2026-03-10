'use client'

import Image from 'next/image'

interface ButtonProps {
  active?: boolean
  onClick?: () => void
}

export function PrevButton({ onClick }: ButtonProps) {
  return (
    <button className='group relative cursor-pointer' onClick={onClick}>
      <Image
        src='/assets/controles/regresar-off.png'
        alt='Regresar'
        width={93}
        height={85}
        className='transition-opacity group-hover:opacity-0 group-active:opacity-0'
        unoptimized
      />
      <Image
        src='/assets/controles/regresar-on.png'
        alt='Regresar'
        width={91}
        height={87}
        className='absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100'
        unoptimized
      />
    </button>
  )
}

export function StopButton({ active, onClick }: ButtonProps) {
  return (
    <button className='group relative cursor-pointer' onClick={onClick}>
      <Image
        src='/assets/controles/stop-off.png'
        alt='Stop'
        width={89}
        height={82}
        className={`transition-opacity group-hover:opacity-0 group-active:opacity-0 ${active ? 'opacity-0' : ''}`}
        unoptimized
      />
      <Image
        src='/assets/controles/stop-on.png'
        alt='Stop'
        width={90}
        height={88}
        className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100 ${active ? 'opacity-100' : ''}`}
        unoptimized
      />
    </button>
  )
}

export function PlayButton({ active, onClick }: ButtonProps) {
  return (
    <button className='group relative cursor-pointer' onClick={onClick}>
      <Image
        src='/assets/controles/play-off.png'
        alt='Play'
        width={90}
        height={84}
        className={`transition-opacity group-hover:opacity-0 group-active:opacity-0 ${active ? 'opacity-0' : ''}`}
        unoptimized
      />
      <Image
        src='/assets/controles/play-on.png'
        alt='Play'
        width={97}
        height={89}
        className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100 ${active ? 'opacity-100' : ''}`}
        unoptimized
      />
    </button>
  )
}

export function PauseButton({ active, onClick }: ButtonProps) {
  return (
    <button className='group relative cursor-pointer' onClick={onClick}>
      <Image
        src='/assets/controles/pausa-off.png'
        alt='Pausa'
        width={93}
        height={85}
        className={`transition-opacity group-hover:opacity-0 group-active:opacity-0 ${active ? 'opacity-0' : ''}`}
        unoptimized
      />
      <Image
        src='/assets/controles/pausa-on.png'
        alt='Pausa'
        width={92}
        height={86}
        className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100 ${active ? 'opacity-100' : ''}`}
        unoptimized
      />
    </button>
  )
}

export function NextButton({ onClick }: ButtonProps) {
  return (
    <button className='group relative cursor-pointer' onClick={onClick}>
      <Image
        src='/assets/controles/adelantar-off.png'
        alt='Adelantar'
        width={95}
        height={86}
        className='transition-opacity group-hover:opacity-0 group-active:opacity-0'
        unoptimized
      />
      <Image
        src='/assets/controles/adelantar-on.png'
        alt='Adelantar'
        width={95}
        height={88}
        className='absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100'
        unoptimized
      />
    </button>
  )
}

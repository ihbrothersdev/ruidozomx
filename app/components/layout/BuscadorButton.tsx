'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BuscadorButton() {
  const pathname = usePathname()
  const isOnComunidad = pathname === '/comunidad'

  if (isOnComunidad) {
    return <></>
  }

  return (
    <Link href='/comunidad'>
      <Image
        src='/assets/header/buscador.png'
        alt='Buscar'
        width={200}
        height={200}
        className='h-10 w-auto md:h-15'
        unoptimized
      />
    </Link>
  )
}

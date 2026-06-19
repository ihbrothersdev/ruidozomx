'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** "Explorar comunidad" nav button — hidden while already on /comunidad. */
export function ExplorarNavButton() {
  const pathname = usePathname()
  if (pathname === '/comunidad' || pathname.startsWith('/comunidad/')) return null

  return (
    <Link href='/comunidad'>
      <Image
        src='/assets/header/explorar.png'
        alt='Explorar'
        width={1383}
        height={455}
        className='h-9 w-auto sm:h-10 md:h-18'
      />
    </Link>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  user: User | null
}

export function Header({ user }: HeaderProps) {
  return (
    <header className='relative z-30 flex items-center justify-between px-4 py-3 md:px-8'>
      {/* Logo */}
      <Link href='/'>
        <Image
          src='/assets/header/logo.png'
          alt='Ruidozo MX'
          width={380}
          height={183}
          className='h-12 w-auto md:h-24'
          unoptimized
          priority
        />
      </Link>

      {/* Navigation buttons */}
      <div className='flex items-center gap-3'>
        <Link href='/quienes-somos'>
          <Image
            src='/assets/header/quienes-somos.png'
            alt='¿Quiénes somos?'
            width={1383}
            height={455}
            className='h-10 w-auto md:h-16'
            unoptimized
          />
        </Link>

        <Link href={user ? '/dashboard' : '/registro/elige-rol'}>
          <Image
            src='/assets/header/registrate-entra.png'
            alt={user ? 'Dashboard' : 'Regístrate / Entra'}
            width={1383}
            height={455}
            className='h-10 w-auto md:h-16'
            unoptimized
          />
        </Link>
      </div>

      {/* TODO: To Be Defined if added */}
      {/* <div className='hidden flex-1 justify-center px-4 md:flex'>
        <button className='relative h-8 w-full max-w-xs md:h-10'>
          <Image
            src='/assets/header/buscador.png'
            alt='Buscar'
            width={528}
            height={80}
            className='h-full w-full object-contain'
            unoptimized
          />
        </button>
      </div> */}
    </header>
  )
}

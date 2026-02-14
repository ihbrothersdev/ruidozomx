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
          className='h-12 w-auto md:h-16'
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
            className='h-8 w-auto md:h-10'
            unoptimized
          />
        </Link>

        {user ? (
          <Link href='/dashboard'>
            <Image
              src='/assets/header/registrate-entra.png'
              alt='Dashboard'
              width={1383}
              height={455}
              className='h-8 w-auto md:h-10'
              unoptimized
            />
          </Link>
        ) : (
          <Link href='/login'>
            <Image
              src='/assets/header/registrate-entra.png'
              alt='Regístrate / Entra'
              width={1383}
              height={455}
              className='h-8 w-auto md:h-10'
              unoptimized
            />
          </Link>
        )}
      </div>
    </header>
  )
}

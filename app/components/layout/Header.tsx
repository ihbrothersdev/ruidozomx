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

        {user ? (
          <Link href='/perfil' className='group flex items-center gap-2'>
            <span className='font-baby-doll hidden rounded-sm bg-black/70 px-3 py-1 text-sm tracking-wide text-white sm:inline-block'>
              {user.email?.split('@')[0] ?? 'Mi cuenta'}
            </span>
            <Image
              src='/assets/header/registrate-entra.png'
              alt='Mi Perfil'
              width={1383}
              height={455}
              className='h-10 w-auto opacity-80 transition-opacity group-hover:opacity-100 md:h-16'
              unoptimized
            />
          </Link>
        ) : (
          <Link href='/registro/elige-rol'>
            <Image
              src='/assets/header/registrate-entra.png'
              alt='Regístrate / Entra'
              width={1383}
              height={455}
              className='h-10 w-auto md:h-16'
              unoptimized
            />
          </Link>
        )}
      </div>
    </header>
  )
}

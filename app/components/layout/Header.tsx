import type { User } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { BuscadorButton } from './BuscadorButton'
import { ProfileDropdown } from './ProfileDropdown'

interface HeaderProps {
  user: User | null
  photoUrl?: string | null
}

export function Header({ user, photoUrl }: HeaderProps) {
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Mi cuenta'

  return (
    <header className='relative z-30 flex flex-col items-center gap-2 px-4 py-3 md:flex-row md:justify-between md:px-8'>
      {/* Logo — centered on mobile, left on desktop */}
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
            className='h-10 w-auto md:h-18'
            unoptimized
          />
        </Link>

        {user ? (
          <ProfileDropdown
            photoUrl={photoUrl ?? null}
            displayName={displayName}
          />
        ) : (
          <Link href='/registro/elige-rol'>
            <Image
              src='/assets/header/registrate-entra.png'
              alt='Regístrate / Entra'
              width={1383}
              height={455}
              className='h-10 w-auto md:h-18'
              unoptimized
            />
          </Link>
        )}

        <BuscadorButton />
      </div>
    </header>
  )
}

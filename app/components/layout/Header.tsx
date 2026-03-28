import type { User } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { ProfileDropdown } from './ProfileDropdown'

interface HeaderProps {
  user: User | null
  photoUrl?: string | null
  role?: string | null
}

export function Header({ user, photoUrl, role }: HeaderProps) {
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Mi cuenta'

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
          <ProfileDropdown
            photoUrl={photoUrl ?? null}
            displayName={displayName}
            role={role}
          />
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

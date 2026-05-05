'use client'

import Image from 'next/image'
import Link from 'next/link'
import BackButton from './BackButton'

interface BackHomeNavProps {
  /** Where Home (logo) button navigates. Defaults to '/'. */
  homeHref?: string
  /** Where Back button navigates. If omitted, uses router.back() with '/' fallback. */
  backHref?: string
  /** Hide the Home (logo) link. */
  showHome?: boolean
  /** Hide the Back button. */
  showBack?: boolean
  /** Extra className for the outer wrapper. */
  className?: string
}

/**
 * Top nav: "Volver" (left) + Ruidozo logo (centered, links to home).
 * Used across registro / perfil pages so the user always has a clear way out.
 */
export default function BackHomeNav({
  homeHref = '/',
  backHref,
  showHome = true,
  showBack = true,
  className = ''
}: BackHomeNavProps) {
  if (!showHome && !showBack) return null

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Back button — absolute left so the logo stays visually centered */}
      {showBack && (
        <div className='absolute left-0'>
          <BackButton href={backHref} />
        </div>
      )}

      {/* Centered logo / home link */}
      {showHome && (
        <Link
          href={homeHref}
          aria-label='Inicio'
          className='inline-block transition-opacity hover:scale-105'
        >
          <Image
            src='/assets/logo.png'
            alt='Ruidozo'
            width={380}
            height={183}
            className='h-12 w-auto sm:h-14'
          />
        </Link>
      )}
    </div>
  )
}

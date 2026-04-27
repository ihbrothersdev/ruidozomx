'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  /** Where to navigate. If omitted, uses router.back() with '/' fallback. */
  href?: string
  /** Tailwind height classes for the image (e.g. 'h-10 sm:h-20'). */
  sizeCls?: string
  /** Extra className for the outer button. */
  className?: string
  /** aria-label override (default: 'Regresar'). */
  ariaLabel?: string
}

/**
 * Reusable "Volver" button. Renders the boton-volver.png asset and either
 * navigates back via history or to a specific href.
 */
export default function BackButton({
  href,
  sizeCls = 'h-10 sm:h-12',
  className = '',
  ariaLabel = 'Regresar'
}: BackButtonProps) {
  const router = useRouter()

  function handleClick() {
    if (href) {
      router.push(href)
      return
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <Image
        src='/assets/registro/formulario/shared/boton-volver.png'
        alt='Volver'
        width={220}
        height={65}
        className={`${sizeCls} w-auto`}
        unoptimized
      />
    </button>
  )
}

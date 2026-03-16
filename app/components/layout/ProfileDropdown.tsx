'use client'

/* eslint-disable @next/next/no-img-element */
import { signout } from '@/app/(auth)/actions'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface ProfileDropdownProps {
  photoUrl: string | null
  displayName: string
}

export function ProfileDropdown({ photoUrl, displayName }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div
      ref={ref}
      className='relative'
    >
      <button
        onClick={() => setOpen(prev => !prev)}
        className='relative cursor-pointer transition-transform hover:scale-105 active:scale-95'
      >
        <Image
          src='/assets/registro/formulario/shared/marco-foto.png'
          alt='Mi perfil'
          width={200}
          height={250}
          className='h-10 w-auto md:h-16'
          style={{ height: undefined }}
          unoptimized
        />
        <div className='absolute inset-x-[4%] top-[12%] bottom-[14%] overflow-hidden'>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={displayName}
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-[#e8b4a8]'>
              <span className='font-baby-doll text-[0.5rem] font-bold text-black/40 uppercase md:text-xs'>
                {displayName.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </button>

      {open && (
        <div className='absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded border-2 border-black/15 bg-[#f5f0e8] shadow-lg'>
          <div className='absolute inset-0 z-0 opacity-30'>
            <Image
              src='/assets/registro/explicacion-rol/shared/fondo.png'
              alt=''
              fill
              className='object-cover'
              unoptimized
            />
          </div>

          <div className='relative z-10 flex flex-col py-2'>
            <Link
              href='/perfil'
              onClick={() => setOpen(false)}
              className='font-pt-mono px-4 py-2.5 text-sm font-bold tracking-wider text-black uppercase transition-colors hover:bg-black/10'
            >
              Perfil
            </Link>
            <div className='mx-3 border-t border-black/10' />
            <form>
              <button
                formAction={signout}
                className='font-pt-mono w-full cursor-pointer px-4 py-2.5 text-left text-sm font-bold tracking-wider text-red-600 uppercase transition-colors hover:bg-black/10'
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

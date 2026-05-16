'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the error to whatever observability we have (currently console).
    // When Sentry is wired up it will be captured here automatically.
    console.error(error)
  }, [error])

  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 text-center'>
      <div
        className='absolute inset-0 z-0 opacity-40'
        style={{
          backgroundImage: "url('/assets/textura/background-textura.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className='relative z-10 flex max-w-md flex-col items-center gap-6'>
        <Link href='/'>
          <Image
            src='/assets/header/logo.png'
            alt='Ruidozo MX'
            width={380}
            height={183}
            className='h-20 w-auto md:h-28'
            priority
          />
        </Link>

        <h1 className='font-impact-label text-[80px] leading-none tracking-wider text-red-600 md:text-[120px]'>
          ERROR
        </h1>

        <div className='space-y-2'>
          <p className='font-baby-doll text-2xl text-white md:text-3xl'>Algo salió mal</p>
          <p className='font-pt-mono text-sm text-gray-400'>El cassette se enredó. Intenta de nuevo en un momento.</p>
        </div>

        <div className='mt-2 flex flex-col items-center gap-3 sm:flex-row'>
          <button
            type='button'
            onClick={reset}
            className='font-baby-doll inline-block border-2 border-white px-8 py-3 text-lg text-white transition-colors hover:border-red-600 hover:bg-red-600'
          >
            Reintentar
          </button>
          <Link
            href='/'
            className='font-baby-doll inline-block border-2 border-white/40 px-8 py-3 text-lg text-white/80 transition-colors hover:border-white hover:text-white'
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import BackButton from '../components/layout/BackButton'

export const metadata: Metadata = {
  title: 'Gracias por cooperar',
  description: 'Juntos sonamos más fuerte. Gracias por cooperar con Ruidozo MX.'
}

export default function GraciasPage() {
  return (
    <main className='relative flex min-h-screen flex-col bg-white'>
      {/* White brick-wall background */}
      <div
        className='fixed inset-0 z-0 bg-white bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/thankyou/background.png')" }}
      />

      <div className='relative z-10 flex min-h-screen flex-col'>
        {/* Logo — centered on mobile, left on desktop */}
        <div className='flex justify-center px-4 pt-4 sm:justify-start'>
          <Link
            href='/'
            aria-label='Inicio'
            className='inline-block transition-transform hover:scale-105'
          >
            <Image
              src='/assets/logo.png'
              alt='Ruidozo MX'
              width={380}
              height={183}
              className='h-10 w-auto sm:h-12'
            />
          </Link>
        </div>

        {/* Thank-you lockup */}
        <div className='flex flex-1 items-center justify-center px-6'>
          <Image
            src='/assets/thankyou/thanks.png'
            alt='Gracias por cooperar. Juntos sonamos más fuerte.'
            width={1686}
            height={781}
            priority
            className='h-auto w-full max-w-3xl'
          />
        </div>

        {/* Volver — bottom right on desktop, centered on mobile. Extra bottom
            padding keeps it clear of the fixed global player bar (taller on
            mobile). */}
        <div className='flex justify-center px-6 pb-44 sm:justify-end sm:pb-24'>
          <BackButton href='/' />
        </div>
      </div>
    </main>
  )
}

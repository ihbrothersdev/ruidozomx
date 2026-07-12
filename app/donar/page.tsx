import Image from 'next/image'
import Link from 'next/link'
import { TrackedDonationLink } from '../components/analytics/TrackedDonationLink'
import BackButton from '../components/layout/BackButton'

export default function DonarPage() {
  return (
    <main className='relative min-h-screen bg-[#e7dfce]'>
      {/* Aged-paper background */}
      <div
        className='fixed inset-0 z-0 bg-[#e7dfce] bg-cover bg-top bg-no-repeat'
        style={{ backgroundImage: "url('/assets/donations/background.png')" }}
      />

      <div className='relative z-10'>
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

        <div className='mx-auto flex max-w-lg flex-col items-center gap-6 px-6 pb-16 text-center'>
          {/* "Ayuda a que el fuego sea más grande" + skull/devil doodles */}
          <h1 className='mt-2 w-full'>
            <Image
              src='/assets/donations/fuego.png'
              alt='Ayuda a que el fuego sea más grande'
              width={1431}
              height={724}
              priority
              className='h-auto w-full'
            />
          </h1>

          {/* Flaming heart-cassette + COPERACHA (baked into the asset) */}
          <Image
            src='/assets/donations/corazon.png'
            alt='Que el ruido no muera — Coperacha'
            width={1712}
            height={1358}
            priority
            className='h-auto w-full max-w-md'
          />

          {/* "Tu cooperación hace posible:" ribbon */}
          <Image
            src='/assets/donations/pergamino.png'
            alt='Tu cooperación hace posible:'
            width={1347}
            height={384}
            className='h-auto w-full max-w-md'
          />

          {/* Perks row. Wide 4:1 strip — on phones let it break past the column
              padding to near full-bleed so the labels stay as legible as possible;
              on sm+ it aligns with the other blocks (max-w-md). */}
          <Image
            src='/assets/donations/orange_box.png'
            alt='Tu cooperación hace posible: desarrollo de nuevas funciones, servidores y mantenimiento, difusión de artistas y eventos, herramientas para la comunidad, y que más personas descubran nuevas propuestas'
            width={1593}
            height={403}
            className='-mx-4 h-auto w-[calc(100%+2rem)] max-w-none sm:mx-auto sm:w-full sm:max-w-md'
          />

          {/* Cooperar → amount-selection page (tracks donation_start) */}
          <TrackedDonationLink
            href='/donar/montos'
            external={false}
            event={{ type: 'donation_start' }}
            className='mt-2 inline-block w-full max-w-[280px] transition-transform hover:scale-105 active:scale-95'
          >
            <Image
              src='/assets/donations/cooperar.png'
              alt='Cooperar'
              width={581}
              height={205}
              className='h-auto w-full'
            />
          </TrackedDonationLink>

          {/* Volver */}
          <div className='mt-2 self-start'>
            <BackButton href='/' />
          </div>
        </div>
      </div>
    </main>
  )
}

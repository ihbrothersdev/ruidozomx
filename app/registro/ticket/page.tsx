'use client'

/* eslint-disable @next/next/no-img-element */
import { type Role } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { sileo } from 'sileo'
import { ROLE_TICKET } from './constants'

export default function TicketPage() {
  return (
    <Suspense>
      <TicketContent />
    </Suspense>
  )
}

function TicketContent() {
  const searchParams = useSearchParams()
  const role = (searchParams.get('role') ?? 'fan') as Role
  const ticket = ROLE_TICKET[role] ?? ROLE_TICKET.fan

  useEffect(() => {
    sileo.info({
      title: 'Confirma tu correo electrónico',
      description: 'Revisa tu bandeja de entrada (y spam) para activar tu cuenta.',
      position: 'top-center'
    })
  }, [])

  return (
    <div className='relative min-h-screen'>
      <div className='absolute inset-0'>
        <Image
          src='/assets/registro/tickets/shared/textura.png'
          alt=''
          fill
          className='object-cover'
          unoptimized
        />
        <div
          className='absolute inset-0 bg-[#E04A42] opacity-[0.70]'
          aria-hidden
        />
      </div>

      <div className='relative z-20 grid min-h-screen grid-cols-1 grid-rows-[1fr_auto] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]'>
        <div className='hidden items-center justify-center px-2 py-4 lg:flex lg:px-4 xl:px-6'>
          <img
            src='/assets/registro/tickets/shared/dit.png'
            alt='DIT Do it together'
            className='h-[50vh] w-auto max-w-full object-contain xl:h-[55vh]'
          />
        </div>

        <div className='relative order-2 flex items-end justify-center lg:order-0 lg:min-h-0 lg:items-end lg:justify-center'>
          <img
            src='/assets/registro/tickets/shared/mano-boleto.png'
            alt='Boleto'
            className='h-[45vh] w-auto max-w-full object-contain object-bottom sm:h-[55vh] lg:hidden'
          />
        </div>

        <div className='order-1 flex flex-col items-center justify-center gap-8 px-4 py-6 sm:justify-center sm:gap-12 md:gap-16 lg:order-0 lg:min-h-0 lg:justify-start lg:gap-32 lg:px-2 lg:py-4 xl:gap-64 xl:py-5'>
          <div className='w-full max-w-xs lg:max-w-none'>
            <img
              src='/assets/registro/tickets/shared/logo.png'
              alt='Ruidozo'
              width={400}
              height={200}
              className='mx-auto h-24 w-48 object-contain object-top sm:ml-auto sm:h-20 sm:w-40 md:h-24 md:w-48 lg:h-[140px] lg:w-[280px] xl:h-[170px] xl:w-[340px]'
            />
          </div>
          <Link
            href='/'
            className='group relative flex flex-col items-center gap-2 sm:gap-3 lg:gap-2'
          >
            <img
              src='/assets/registro/tickets/shared/boton-entrar.png'
              alt='Entrar'
              className='w-24 transition-opacity group-hover:opacity-0 sm:w-24 md:w-28 lg:w-36 xl:w-40'
            />
            <img
              src='/assets/registro/tickets/shared/boton-entrar-hover.png'
              alt=''
              className='absolute top-0 left-1/2 w-24 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 sm:w-24 md:w-28 lg:w-36 xl:w-40'
            />
            <span className='font-baby-doll text-sm font-bold tracking-[0.2em] text-white sm:text-base md:text-lg lg:text-xl'>
              ENTRA
            </span>
          </Link>
        </div>
      </div>

      <img
        src='/assets/registro/tickets/shared/mano-boleto.png'
        alt='Boleto'
        className='absolute right-0 bottom-0 z-10 hidden h-screen w-full object-contain object-bottom-right sm:w-4/5 md:w-3/4 lg:block lg:w-2/3'
      />

      <div className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center p-4'>
        <div className='text-center'>
          {ticket.topLine && <p>{ticket.topLine}</p>}
          <p>{ticket.headlinePre}</p>
          <p>{ticket.headline}</p>
          {ticket.detail && <p>{ticket.detail}</p>}
          <p>{ticket.detailSub}</p>
        </div>
      </div>
      <Link
        href='/'
        className='absolute bottom-4 left-1/2 z-20 -translate-x-1/2 underline'
      >
        Ir al inicio
      </Link>
    </div>
  )
}

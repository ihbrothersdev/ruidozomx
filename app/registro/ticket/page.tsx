'use client'

/* eslint-disable @next/next/no-img-element */
import { ROLES, type Role } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { sileo } from 'sileo'
import TicketText from './_components/TicketText'

export default function TicketPage() {
  return (
    <Suspense>
      <TicketContent />
    </Suspense>
  )
}

function TicketContent() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const role: Role = roleParam && ROLES.includes(roleParam as Role) ? (roleParam as Role) : 'fan'

  useEffect(() => {
    false && sileo.info({
      title: 'Confirma tu correo electrónico',
      description: 'Revisa tu bandeja de entrada (y spam) para activar tu cuenta.',
      position: 'top-center'
    })
  }, [])

  return (
    <div className='relative min-h-screen overflow-hidden'>
      <div className='absolute inset-0'>
        <Image
          src='/assets/registro/tickets/shared/red-background.png'
          alt=''
          fill
          className='object-cover'
          unoptimized
        />
      </div>

      <div className='relative z-20 grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]'>
        <div className='hidden items-center justify-center px-2 py-4 lg:flex lg:px-4 xl:px-6'>
          <img
            src='/assets/registro/tickets/shared/dit.png'
            alt='DIT Do it together'
            className='h-[50vh] w-auto max-w-full object-contain xl:h-[55vh]'
          />
        </div>

        <div className='hidden lg:block' />

        <div className='flex flex-col items-center justify-center gap-8 px-4 py-6 sm:justify-center sm:gap-12 md:gap-16 lg:min-h-0 lg:justify-start lg:gap-32 lg:px-2 lg:py-4 xl:gap-64 xl:py-5'>
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
            <span className='font-baby-doll text-md font-bold tracking-[0.2em] text-black sm:text-base md:text-xl lg:text-xl'>
              ENTRA
            </span>
          </Link>
        </div>
      </div>

      {/* Ticket — fixed at the bottom center */}
      <div className='fixed right-0 bottom-0 left-0 z-30 flex justify-center pointer-events-none'>
        <div className='relative'>
          {/* Small screens */}
          <img
            src='/assets/registro/tickets/shared/mano-boleto-sm.png'
            alt='Boleto'
            className='block h-[55vh] w-auto object-contain object-bottom sm:h-[60vh] lg:hidden'
          />
          {/* Large screens */}
          <img
            src='/assets/registro/tickets/shared/mano-boleto-lg.png'
            alt='Boleto'
            className='hidden h-[85vh] w-auto object-contain object-bottom lg:block xl:h-[90vh]'
          />
          {/* Ticket text overlay */}
          <div
            className='pointer-events-none absolute top-[5%] left-[8%] h-[62%] w-[55%]'
          >
            <TicketText
              role={role}
              className='h-full'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

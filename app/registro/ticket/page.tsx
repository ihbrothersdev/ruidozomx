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
  const displayName = searchParams.get('name') ?? ''

  useEffect(() => {
    if (!displayName) return
    sileo.info({
      title: 'Confirma tu correo electrónico',
      description: 'Revisa tu bandeja de entrada (y spam) para activar tu cuenta.',
      position: 'top-center',
      duration: 8000
    })
  }, [displayName])

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

      {/* ── Mobile layout ── */}
      <div className='relative z-20 flex min-h-screen flex-col items-center md:hidden'>
        {/* Logo */}
        <div className='w-full px-4 pt-6 pb-2'>
          <img
            src='/assets/registro/tickets/shared/logo.png'
            alt='Ruidozo'
            width={400}
            height={200}
            className='mx-auto h-16 w-auto object-contain'
          />
        </div>

        {/* Ticket with text */}
        <div className='relative mx-auto w-[85%] max-w-sm'>
          <img
            src='/assets/registro/tickets/shared/mano-boleto-sm.png'
            alt='Boleto'
            className='w-full object-contain'
          />
          <div className='absolute top-[3%] left-[13%] h-[45%] w-[55%]'>
            <TicketText
              role={role}
              displayName={displayName}
              className='h-full'
            />
          </div>
        </div>

        {/* DIT */}
        <div className='flex items-center justify-center px-4 py-4'>
          <img
            src='/assets/registro/tickets/shared/dit.png'
            alt='DIT Do it together'
            className='h-[15vh] w-auto object-contain'
          />
        </div>

        {/* ENTRA button */}
        <Link
          href='/'
          className='group relative flex flex-col items-center gap-2 pb-8'
        >
          <img
            src='/assets/registro/tickets/shared/boton-entrar.png'
            alt='Entrar'
            className='w-20 transition-opacity group-hover:opacity-0'
          />
          <img
            src='/assets/registro/tickets/shared/boton-entrar-hover.png'
            alt=''
            className='absolute top-0 left-1/2 w-20 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100'
          />
          <span className='font-baby-doll text-md font-bold tracking-[0.2em] text-black'>
            ENTRA
          </span>
        </Link>
      </div>

      {/* ── Desktop layout ── */}
      <div className='relative z-20 hidden min-h-screen md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]'>
        {/* DIT — left column */}
        <div className='flex items-center justify-center px-4 xl:px-6'>
          <img
            src='/assets/registro/tickets/shared/dit.png'
            alt='DIT Do it together'
            className='h-[75vh] w-auto max-w-full object-contain xl:h-[80vh]'
          />
        </div>

        <div />

        {/* Logo + ENTRA — right column */}
        <div className='relative flex flex-col items-center justify-start gap-32 px-2 py-4 xl:gap-64 xl:py-5'>
          <div className='w-full'>
            <img
              src='/assets/registro/tickets/shared/logo.png'
              alt='Ruidozo'
              width={400}
              height={200}
              className='ml-auto h-24 w-48 object-contain object-top lg:h-[140px] lg:w-[280px] xl:h-[170px] xl:w-[340px]'
            />
          </div>
          <Link
            href='/'
            className='group relative flex flex-col items-center gap-2 md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2'
          >
            <img
              src='/assets/registro/tickets/shared/boton-entrar.png'
              alt='Entrar'
              className='w-28 transition-opacity group-hover:opacity-0 lg:w-36 xl:w-40'
            />
            <img
              src='/assets/registro/tickets/shared/boton-entrar-hover.png'
              alt=''
              className='absolute top-0 left-1/2 w-28 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 lg:w-36 xl:w-40'
            />
            <span className='font-baby-doll text-xl font-bold tracking-[0.2em] text-black'>
              ENTRA
            </span>
          </Link>
        </div>
      </div>

      {/* Ticket — fixed at bottom (desktop only) */}
      <div className='pointer-events-none fixed right-0 bottom-0 left-0 z-30 hidden justify-center md:flex'>
        <div className='relative'>
          <img
            src='/assets/registro/tickets/shared/mano-boleto-lg.png'
            alt='Boleto'
            className='h-[60vh] w-auto object-contain object-bottom lg:h-[85vh] xl:h-[90vh]'
          />
          <div className='absolute top-[5%] left-[8%] h-[62%] w-[55%]'>
            <TicketText
              role={role}
              displayName={displayName}
              className='h-full'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

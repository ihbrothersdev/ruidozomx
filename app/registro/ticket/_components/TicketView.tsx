'use client'

/* eslint-disable @next/next/no-img-element */
import { ROLES, type Role } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { sileo } from 'sileo'
import TicketText from './TicketText'

interface TicketViewProps {
  /** Whether the visitor already confirmed their email (and has an active session). */
  isLoggedIn?: boolean
}

export default function TicketView({ isLoggedIn = false }: TicketViewProps) {
  return (
    <Suspense>
      <TicketContent isLoggedIn={isLoggedIn} />
    </Suspense>
  )
}

function TicketContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const role: Role = roleParam && ROLES.includes(roleParam as Role) ? (roleParam as Role) : 'fan'
  const displayName = searchParams.get('name') ?? ''

  useEffect(() => {
    if (!displayName) return
    // After email confirmation the user IS logged in — show a welcome toast
    // instead of asking them to confirm something they already did.
    if (isLoggedIn) {
      sileo.success({
        title: `¡Bienvenido${displayName ? `, ${displayName}` : ''}!`,
        description: 'Tu cuenta está lista.',
        position: 'top-center',
        duration: 6000
      })
      return
    }
    sileo.info({
      title: 'Confirma tu correo electrónico',
      description: 'Revisa tu bandeja de entrada (y spam) para activar tu cuenta.',
      position: 'top-center',
      duration: 8000
    })
  }, [displayName, isLoggedIn])

  return (
    <div className='relative min-h-screen overflow-hidden'>
      <div className='absolute inset-0'>
        <Image
          src='/assets/registro/tickets/shared/red-background.png'
          alt=''
          fill
          className='object-cover'
        />
      </div>

      {/* ── Mobile layout (<768) ── */}
      <div className='relative z-20 flex min-h-screen flex-col items-center md:hidden'>
        {/* Logo — top */}
        <div className='w-full px-4 pt-6 pb-2'>
          <img
            src='/assets/registro/tickets/shared/logo.png'
            alt='Ruidozo'
            width={400}
            height={200}
            className='mx-auto h-16 w-auto object-contain'
          />
        </div>

        {/* Ticket — small hand pegged to the right */}
        <div className='relative w-[95%] max-w-md self-end sm:w-[85%] sm:max-w-lg'>
          <img
            src='/assets/registro/tickets/shared/mano-boleto-sm.png'
            alt='Boleto'
            className='w-full object-contain'
          />
          <div className='absolute top-[3%] left-[13%] h-[45%] w-[55%]'>
            <TicketText
              role={role}
              displayName={displayName}
              isLoggedIn={isLoggedIn}
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

        {/* ENTRA button — bottom centered */}
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
          <span className='font-baby-doll text-md font-bold tracking-[0.2em] text-black'>ENTRA</span>
        </Link>
      </div>

      {/* ── Desktop layout (md+) ── */}
      <div className='relative z-20 hidden min-h-screen md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]'>
        {/* DIT — left column */}
        <div className='flex items-start justify-center px-4 pt-6 lg:items-center lg:pt-0 xl:px-6'>
          <img
            src='/assets/registro/tickets/shared/dit.png'
            alt='DIT Do it together'
            className='h-auto max-h-[60vh] w-auto max-w-full object-contain lg:h-[75vh] lg:max-h-none xl:h-[80vh]'
          />
        </div>

        <div />

        {/* Logo + ENTRA — right column */}
        <div className='relative flex flex-col items-center justify-start gap-12 px-2 py-4 lg:gap-32 xl:gap-64 xl:py-5'>
          <div className='w-full'>
            <img
              src='/assets/registro/tickets/shared/logo.png'
              alt='Ruidozo'
              width={400}
              height={200}
              className='ml-auto h-20 w-40 object-contain object-top lg:h-[140px] lg:w-[280px] xl:h-[170px] xl:w-[340px]'
            />
          </div>
          <Link
            href='/perfil'
            className='group relative flex flex-col items-center gap-2 lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2'
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
            <span className='font-baby-doll text-xl font-bold tracking-[0.2em] text-black'>ENTRA</span>
          </Link>
        </div>
      </div>

      {/* Ticket — fixed at bottom (md+ only) */}
      <div className='pointer-events-none fixed right-0 bottom-0 left-0 z-30 hidden justify-center md:flex'>
        <div className='relative'>
          <img
            src='/assets/registro/tickets/shared/mano-boleto-lg.png'
            alt='Boleto'
            className='h-[78vh] w-auto object-contain object-bottom lg:h-[85vh] xl:h-[90vh]'
          />
          <div className='absolute top-[5%] left-[8%] h-[62%] w-[55%]'>
            <TicketText
              role={role}
              displayName={displayName}
              isLoggedIn={isLoggedIn}
              className='h-full'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

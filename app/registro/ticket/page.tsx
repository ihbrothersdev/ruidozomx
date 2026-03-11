'use client'

import { ROLE_LABELS, type Role } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { sileo } from 'sileo'
import { ROLE_ACTIONS } from './constants'

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
  const actions = ROLE_ACTIONS[role] ?? ROLE_ACTIONS.fan

  useEffect(() => {
    sileo.info({
      title: 'Confirma tu correo electrónico',
      description: 'Revisa tu bandeja de entrada (y spam) para activar tu cuenta.',
      position: 'top-center'
    })
  }, [])

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Dark texture background */}
      <Image
        src='/assets/registro/tickets/shared/textura.png'
        alt=''
        fill
        className='object-cover'
        priority
        unoptimized
      />

      <div className='relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-8'>
        {/* Logo */}
        <Image
          src='/assets/registro/tickets/shared/logo.png'
          alt='Ruidozo'
          width={300}
          height={100}
          className='mb-6 w-40 sm:w-52'
          style={{ height: 'auto' }}
          unoptimized
        />

        {/* DIT decoration */}
        <Image
          src='/assets/registro/tickets/shared/dit.png'
          alt='D.I.T.'
          width={150}
          height={200}
          className='mb-4 w-20 sm:w-24'
          style={{ height: 'auto' }}
          unoptimized
        />

        {/* Welcome text */}
        <h1 className='font-baby-doll mb-2 text-center text-3xl tracking-wide text-white sm:text-4xl'>¡Bienvenido!</h1>
        <p className='font-pt-mono mb-8 text-center text-sm text-white/70'>
          Tu perfil de <strong className='text-white'>{ROLE_LABELS[role]}</strong> ha sido creado
        </p>

        {/* Ticket card */}
        <div className='relative mx-auto w-full max-w-sm'>
          <Image
            src='/assets/registro/tickets/shared/mano-boleto.png'
            alt='Ticket'
            width={300}
            height={400}
            className='mx-auto w-64 sm:w-72'
            style={{ height: 'auto' }}
            unoptimized
          />

          {/* Actions overlaid on ticket */}
          <div className='absolute inset-x-[18%] top-[8%] bottom-[32%] flex flex-col justify-center gap-1 px-2'>
            <p className='font-pt-mono text-[9px] font-bold tracking-wider text-black/60 uppercase'>
              Tus próximos pasos:
            </p>
            {actions.map((action, i) => (
              <p
                key={i}
                className='font-pt-mono text-[10px] leading-tight text-black/80'
              >
                {i + 1}. {action}
              </p>
            ))}
          </div>
        </div>

        {/* Enter button */}
        <Link
          href='/'
          className='mt-8'
        >
          <Image
            src='/assets/registro/tickets/shared/boton-entrar.png'
            alt='Entrar'
            width={140}
            height={160}
            className='w-20 transition-opacity hover:opacity-80 sm:w-24'
            style={{ height: 'auto' }}
            unoptimized
          />
        </Link>
      </div>
    </div>
  )
}

'use client'

/* eslint-disable @next/next/no-img-element */
import { ROLES, type Role } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { sileo } from 'sileo'
import { getTicketSections } from './constants'

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
  const sections = getTicketSections(role)

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

      <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4'>
        <div className='flex max-w-md flex-col gap-16 sm:gap-18 lg:gap-24'>
          {sections.map(sec => (
            <section
              key={sec.name}
              className='flex flex-col gap-0.5'
            >
              {sec.name === 'footer' && (
                <div className='mb-1 flex items-start gap-2'>
                  <div className='aspect-square w-12 shrink-0 rounded bg-black/10 sm:w-14' />
                  <div className='flex flex-1 flex-col gap-0.5'>
                    {sec.lines.map((line, j) => (
                      <p
                        key={j}
                        className={`font-baby-doll text-xs font-bold uppercase sm:text-sm lg:text-base ${line.color === 'red' ? 'text-red-700' : 'text-black'}`}
                      >
                        {line.text}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {sec.name !== 'footer' &&
                sec.lines.map((line, j) => {
                  const sizeClass =
                    sec.name === 'headline'
                      ? 'text-4xl sm:text-5xl lg:text-6xl'
                      : sec.name === 'main'
                        ? j === 0
                          ? 'text-xl font-black sm:text-2xl lg:text-3xl'
                          : 'text-xs sm:text-sm lg:text-base'
                        : sec.name === 'cta'
                          ? 'text-base font-black sm:text-lg lg:text-xl'
                          : 'text-xs sm:text-sm lg:text-base'
                  return (
                    <p
                      key={j}
                      className={`font-baby-doll font-bold uppercase ${sizeClass} ${line.color === 'red' ? 'text-red-700' : 'text-black'}`}
                    >
                      {line.text}
                    </p>
                  )
                })}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import type { RegistrationSource, Role } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { PROVEEDOR_CARD, TOP_ROW_CARDS, type RoleCard } from './constants'

export default function EligeRolPage() {
  return (
    <Suspense>
      <EligeRolContent />
    </Suspense>
  )
}

function CardLink({ card, href }: { card: RoleCard; href: string }) {
  return (
    <Link
      href={href}
      className={`block transition-transform duration-200 hover:z-30 hover:scale-110 ${card.tilt}`}
    >
      <Image
        src={card.src}
        alt={card.alt}
        width={400}
        height={520}
        className='max-h-[28vw] w-full object-contain drop-shadow-lg'
        style={{ height: 'auto' }}
        unoptimized
      />
    </Link>
  )
}

function EligeRolContent() {
  const searchParams = useSearchParams()
  const source = (searchParams.get('source') ?? 'registro') as RegistrationSource

  function buildHref(role: Role | 'manager_group') {
    return `/registro/explicacion-rol?role=${role}&source=${source}`
  }

  return (
    <div
      className='relative min-h-screen w-screen overflow-x-hidden'
      style={{
        backgroundImage: "url('/assets/registro/elige-rol/back.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* === MOBILE (< lg) === */}
      <div className='relative z-10 flex min-h-screen flex-col items-center gap-6 px-6 py-12 lg:hidden'>
        <Image
          src='/assets/registro/elige-rol/flecha-elige.png'
          alt='Elige tu rol'
          width={180}
          height={320}
          className='w-24 sm:w-28'
          style={{ height: 'auto' }}
          unoptimized
        />

        <div className='grid w-full max-w-md grid-cols-2 gap-3 sm:max-w-lg sm:gap-4'>
          {[...TOP_ROW_CARDS, PROVEEDOR_CARD].map(card => (
            <Link
              key={card.alt}
              href={buildHref(card.role)}
              className='transition-transform active:scale-95'
            >
              <Image
                src={card.src}
                alt={card.alt}
                width={320}
                height={420}
                className='w-full drop-shadow-md'
                style={{ height: 'auto' }}
                unoptimized
              />
            </Link>
          ))}
        </div>

        <div className='flex items-center gap-3 pt-4'>
          <Image
            src='/assets/registro/elige-rol/ya-tienes-cuenta.png'
            alt='¿Ya tienes cuenta?'
            width={200}
            height={36}
            className='h-auto w-36 sm:w-44'
            unoptimized
          />
          <Image
            src='/assets/registro/elige-rol/flecha.png'
            alt=''
            width={60}
            height={40}
            className='h-auto w-10 sm:w-12'
            unoptimized
          />
          <Link href='/iniciar-sesion'>
            <Image
              src='/assets/registro/elige-rol/boton-entra.png'
              alt='Entra'
              width={100}
              height={36}
              className='h-auto w-16 transition-transform hover:scale-105 sm:w-20'
              unoptimized
            />
          </Link>
        </div>
      </div>

      {/* === DESKTOP (>= lg) — pure flex === */}
      <div className='relative z-10 hidden h-screen flex-row items-center justify-center gap-[2vw] px-[2%] py-[2vh] lg:flex'>
        {/* Arrow — left side */}
        <Image
          src='/assets/registro/elige-rol/flecha-elige.png'
          alt='Elige tu rol'
          width={220}
          height={400}
          className='w-[13vw] max-w-64 min-w-32 shrink-0'
          style={{ height: 'auto' }}
          unoptimized
        />

        {/* Right side: two rows of cards */}
        <div className='flex flex-1 flex-col'>
          {/* Row 1: 4 cards */}
          <div className='flex justify-around'>
            {TOP_ROW_CARDS.map(card => (
              <div
                key={card.alt}
                className='w-[23%]'
              >
                <CardLink
                  card={card}
                  href={buildHref(card.role)}
                />
              </div>
            ))}
          </div>

          {/* Row 2: Proveedor + CTA */}
          <div className='flex items-end justify-between'>
            <div className='w-[23%]'>
              <CardLink
                card={PROVEEDOR_CARD}
                href={buildHref(PROVEEDOR_CARD.role)}
              />
            </div>

            <div className='flex items-center gap-[2vw]'>
              <Image
                src='/assets/registro/elige-rol/ya-tienes-cuenta.png'
                alt='¿Ya tienes cuenta?'
                width={300}
                height={50}
                className='h-auto w-[18vw] max-w-72 min-w-44'
                unoptimized
              />
              <Image
                src='/assets/registro/elige-rol/flecha.png'
                alt=''
                width={80}
                height={50}
                className='h-auto w-[7vw] max-w-24 min-w-16'
                unoptimized
              />
              <Link
                href='/iniciar-sesion'
                className='transition-transform hover:scale-105'
              >
                <Image
                  src='/assets/registro/elige-rol/boton-entra.png'
                  alt='Entra'
                  width={160}
                  height={50}
                  className='h-auto w-[8vw] max-w-32 min-w-20'
                  unoptimized
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

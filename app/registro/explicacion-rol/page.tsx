'use client'

/* eslint-disable @next/next/no-img-element */
import type { RegistrationSource } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { redirect, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ROLE_EXPLANATIONS } from './constants'

const S = '/assets/registro/explicacion-rol/shared'

export default function ExplicacionRolPage() {
  return (
    <Suspense>
      <ExplicacionRolContent />
    </Suspense>
  )
}

function ExplicacionRolContent() {
  const searchParams = useSearchParams()
  const roleKey = searchParams.get('role')
  const source = (searchParams.get('source') ?? 'registro') as RegistrationSource

  if (!roleKey || !ROLE_EXPLANATIONS[roleKey]) {
    redirect(`/registro/elige-rol?source=${source}`)
  }

  const data = ROLE_EXPLANATIONS[roleKey]

  const formHref =
    roleKey === 'manager_group'
      ? `/registro/formulario?role=manager&source=${source}`
      : `/registro/formulario?role=${data.formRole}&source=${source}`
  const backHref = `/registro/elige-rol?source=${source}`

  return (
    <div className='relative min-h-screen w-screen overflow-x-hidden lg:h-screen lg:overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <Image
          src={`${S}/fondo.png`}
          alt=''
          fill
          className='object-cover'
          priority
          unoptimized
        />
      </div>

      <div className='relative z-10 flex h-[100dvh] flex-col justify-between px-5 pt-2 pb-4 lg:hidden'>
        <div className='flex flex-col items-center gap-2'>
          <img
            src={data.illustration}
            alt={data.title}
            className='h-[38vh] w-auto object-contain'
          />
          <div className='flex items-center gap-2'>
            <img
              src={`${S}/rayo.png`}
              alt=''
              className='h-10 w-auto shrink-0'
            />
            <h1 className='font-baby-doll text-[2.2rem] leading-[0.85] font-black whitespace-pre-line text-black uppercase'>
              {data.title}
            </h1>
          </div>
        </div>

        <div className='flex flex-col gap-3'>
          <p className='font-pt-mono text-[0.85rem] leading-snug font-bold text-black/80 uppercase'>{data.subtitle}</p>
          {data.sectionHeader && (
            <h2 className='font-pt-mono text-lg font-bold text-black uppercase'>{data.sectionHeader}</h2>
          )}
          <ul className='flex flex-col gap-4'>
            {data.bullets.map((bullet, i) => (
              <li
                key={i}
                className='flex items-start gap-2'
              >
                <span className='mt-[0.2em] shrink-0 text-base leading-none text-black'>•</span>
                <span className='font-pt-mono text-[0.95rem] leading-relaxed text-black/80'>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className='flex w-full items-center justify-center gap-3'>
          <Link
            href={backHref}
            className='relative shrink-0 transition-transform hover:scale-105 active:scale-95'
          >
            <img
              src={`${S}/boton-regresar.png`}
              alt=''
              className='h-12 w-[145px]'
            />
            <span className='font-baby-doll absolute inset-0 flex items-center justify-center text-[0.8rem] font-bold tracking-[0.15em] text-white uppercase'>
              Regresar
            </span>
          </Link>
          <img
            src={`${S}/mano.png`}
            alt=''
            className='h-auto w-11 shrink-0'
          />
          <Link
            href={formHref}
            className='relative shrink-0 transition-transform hover:scale-105 active:scale-95'
          >
            <img
              src={`${S}/boton-crear-perfil.png`}
              alt=''
              className='h-12 w-[145px]'
            />
            <span className='font-baby-doll absolute inset-0 flex items-center justify-center text-[0.8rem] font-bold tracking-[0.15em] text-white uppercase'>
              Crear mi perfil
            </span>
          </Link>
        </div>
      </div>

      <img
        src={data.illustration}
        alt={data.title}
        className='absolute bottom-0 left-0 z-10 hidden max-w-[40%] object-contain lg:block lg:h-[92vh]'
      />

      <div className='relative z-20 hidden h-full flex-col lg:flex'>
        <div className='flex flex-1 flex-col justify-center gap-5 pr-12 pl-[44%] xl:pr-16'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-4'>
              <img
                src={`${S}/rayo.png`}
                alt=''
                className='h-[clamp(3.5rem,7vw,6.5rem)] w-auto shrink-0'
              />
              <h1 className='font-baby-doll text-[clamp(2.5rem,5.5vw,5rem)] leading-[0.9] font-black whitespace-pre-line text-black uppercase'>
                {data.title}
              </h1>
            </div>
            <p className='font-pt-mono pl-40 text-[clamp(0.8rem,1.3vw,1.15rem)] leading-snug font-bold whitespace-pre-line text-black/80 uppercase'>
              {data.subtitle}
            </p>
          </div>

          {data.sectionHeader && (
            <h2 className='font-pt-mono text-[clamp(1.1rem,1.8vw,1.6rem)] font-bold text-black uppercase'>
              {data.sectionHeader}
            </h2>
          )}

          <ul className='flex flex-col gap-3'>
            {data.bullets.map((bullet, i) => (
              <li
                key={i}
                className='flex items-start gap-3'
              >
                <span className='mt-[0.15em] shrink-0 text-[clamp(0.9rem,1.3vw,1.15rem)] leading-none text-black'>
                  •
                </span>
                <span className='font-pt-mono text-[clamp(0.9rem,1.3vw,1.15rem)] leading-snug text-black/80'>
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className='flex w-full items-center justify-end gap-8 pr-[5%] pb-8'>
          <Link
            href={backHref}
            className='relative shrink-0 transition-transform hover:scale-105 active:scale-95'
          >
            <img
              src={`${S}/boton-regresar.png`}
              alt=''
              className='h-[clamp(2.8rem,4.5vw,4rem)] w-[clamp(200px,22vw,340px)]'
            />
            <span className='font-baby-doll absolute inset-0 flex items-center justify-center text-[clamp(0.9rem,1.5vw,1.35rem)] font-bold tracking-[0.15em] text-white uppercase'>
              Regresar
            </span>
          </Link>

          <img
            src={`${S}/mano.png`}
            alt=''
            className='h-auto w-[clamp(60px,7vw,110px)] shrink-0'
          />

          <Link
            href={formHref}
            className='relative shrink-0 transition-transform hover:scale-105 active:scale-95'
          >
            <img
              src={`${S}/boton-crear-perfil.png`}
              alt=''
              className='h-[clamp(2.8rem,4.5vw,4rem)] w-[clamp(200px,22vw,340px)]'
            />
            <span className='font-baby-doll absolute inset-0 flex items-center justify-center text-[clamp(0.9rem,1.5vw,1.35rem)] font-bold tracking-[0.15em] text-white uppercase'>
              Crear mi perfil
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { type RegistrationSource, type Role } from '@/lib/types'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { BandaFormLayout } from './_components/BandaFormLayout'
import { FanFormLayout } from './_components/FanFormLayout'
import { ManagerGroupFormLayout } from './_components/ManagerGroupFormLayout'
import { ProveedorFormLayout } from './_components/ProveedorFormLayout'
import { VenueFormLayout } from './_components/VenueFormLayout'
import { ROLE_ETIQUETA } from './constants'

const ROLE_FORM_MAP: Record<Role, (role: Role) => React.ReactNode> = {
  banda: () => <BandaFormLayout />,
  manager: r => <ManagerGroupFormLayout initialRole={r as 'manager' | 'promotor' | 'agente'} />,
  promotor: r => <ManagerGroupFormLayout initialRole={r as 'manager' | 'promotor' | 'agente'} />,
  agente: r => <ManagerGroupFormLayout initialRole={r as 'manager' | 'promotor' | 'agente'} />,
  fan: () => <FanFormLayout />,
  proveedor: () => <ProveedorFormLayout />,
  venue: () => <VenueFormLayout />
}

export default function FormularioPage() {
  return (
    <Suspense>
      <FormularioContent />
    </Suspense>
  )
}

function FormularioContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = (searchParams.get('role') ?? 'fan') as Role
  const source = (searchParams.get('source') ?? 'registro') as RegistrationSource
  const error = searchParams.get('error')

  const etiquetaSrc = ROLE_ETIQUETA[role]

  const ARRAY_FIELDS = new Set(['favorite_genres', 'venue_type', 'territorial_reach', 'service_types', 'event_types'])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const data: Record<string, string | string[]> = {}
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) continue
      if (ARRAY_FIELDS.has(key)) {
        if (!data[key]) data[key] = []
        ;(data[key] as string[]).push(value)
      } else {
        data[key] = value
      }
    }

    sessionStorage.setItem('ruidozo_profile', JSON.stringify(data))
    router.push(`/registro/crear-cuenta?role=${role}&source=${source}`)
  }

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Red background */}
      <Image
        src='/assets/registro/formulario/shared/red-back.png'
        alt=''
        fill
        className='object-cover'
        priority
        unoptimized
      />

      <div className='relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-6 sm:px-6'>
        {/* Grey folder card */}
        <div className='relative w-full overflow-hidden'>
          {/* Mobile: simple rectangular background */}
          <Image
            src='/assets/registro/formulario/shared/folder-grey-back-mobile.png'
            alt=''
            fill
            className='object-cover lg:hidden'
            unoptimized
          />
          {/* Desktop: folder with tab cut */}
          <Image
            src='/assets/registro/formulario/shared/folder-grey-back.png'
            alt=''
            fill
            className='hidden object-fill lg:block'
            unoptimized
          />
          <div className='relative z-10 px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 lg:px-12 lg:pt-4 lg:pb-12'>
            {/* Role etiqueta */}
            <div className='relative mb-4 flex justify-center lg:justify-start'>
              {/* Rayo - mobile only, right side */}
              <Image
                src='/assets/registro/formulario/shared/rayo.png'
                alt=''
                width={60}
                height={80}
                className='absolute right-0 top-0 h-8 w-auto lg:hidden'
                unoptimized
              />
              {etiquetaSrc && (
                <Image
                  src={etiquetaSrc}
                  alt={role}
                  width={350}
                  height={80}
                  className='w-56 -rotate-2 sm:w-72 lg:w-[350px]'
                  style={{ height: 'auto' }}
                  unoptimized
                />
              )}
            </div>

            {error && (
              <div className='font-pt-mono mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700'>
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className='space-y-3'
            >
              <input
                type='hidden'
                name='role'
                value={role}
              />
              <input
                type='hidden'
                name='source'
                value={source}
              />

              {(ROLE_FORM_MAP[role] ?? ROLE_FORM_MAP.fan)(role)}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

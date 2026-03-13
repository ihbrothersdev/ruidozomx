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

const MANAGER_GROUP_ROLES = new Set<Role>(['manager', 'agente', 'promotor'])

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

  const ARRAY_FIELDS = new Set([
    'favorite_genres',
    'capacity',
    'venue_type',
    'territorial_reach',
    'service_types',
    'event_types'
  ])

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
          {/* Grey folder background — natural shape with tab cut */}
          <Image
            src='/assets/registro/formulario/shared/folder-grey-back.png'
            alt=''
            fill
            className='object-fill'
            unoptimized
          />
          <div className='relative z-10 px-5 py-3 sm:p-5 lg:p-8'>
            {/* Role etiqueta */}
            <div className='mb-4'>
              {role === 'banda' ? (
                <span className='font-baby-doll inline-block -rotate-2 rounded-sm bg-red-600 px-5 py-2 text-xl tracking-wider text-white shadow-md sm:text-2xl'>
                  BANDA / SOLISTA
                </span>
              ) : etiquetaSrc ? (
                <Image
                  src={etiquetaSrc}
                  alt={role}
                  width={250}
                  height={60}
                  className='w-40 -rotate-2 sm:w-48'
                  style={{ height: 'auto' }}
                  unoptimized
                />
              ) : null}
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

              {role === 'banda' ? (
                <BandaFormLayout />
              ) : MANAGER_GROUP_ROLES.has(role) ? (
                <ManagerGroupFormLayout initialRole={role as 'manager' | 'promotor' | 'agente'} />
              ) : role === 'fan' ? (
                <FanFormLayout />
              ) : role === 'proveedor' ? (
                <ProveedorFormLayout />
              ) : role === 'venue' ? (
                <VenueFormLayout />
              ) : (
                <FanFormLayout />
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Label } from '@/app/components/ui/label'
import { type RegistrationSource, type Role } from '@/lib/types'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { BandaFormLayout } from './_components/BandaFormLayout'
import { FanFields } from './_components/FanFields'
import { LocationFields } from './_components/LocationFields'
import { ManagerGroupFormLayout } from './_components/ManagerGroupFormLayout'
import { ProveedorFields } from './_components/ProveedorFields'
import { VenueFields } from './_components/VenueFields'
import { ROLE_ETIQUETA } from './constants'

const MANAGER_GROUP_ROLES = new Set<Role>(['manager', 'agente', 'promotor'])

const ROLE_FIELDS: Record<string, React.FC> = {
  fan: FanFields,
  proveedor: ProveedorFields,
  venue: VenueFields
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

  const RoleSpecificFields = ROLE_FIELDS[role] ?? FanFields
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
              ) : (
                <>
                  <div className='flex flex-col gap-6 lg:flex-row'>
                    <div className='min-w-0 flex-1 space-y-2'>
                      <LocationFields />
                      <RoleSpecificFields />
                    </div>
                    <div className='flex w-full shrink-0 flex-col items-center gap-3 overflow-visible lg:w-56 lg:items-end'>
                      <div className='flex items-end gap-2 self-center lg:self-end'>
                        <Image
                          src='/assets/registro/formulario/shared/flecha-naranja.png'
                          alt=''
                          width={80}
                          height={100}
                          className='mb-6 hidden w-18 shrink-0 lg:block'
                          style={{ height: 'auto' }}
                          unoptimized
                        />
                        <div className='relative flex flex-col items-center lg:pr-12'>
                          <Image
                            src='/assets/registro/formulario/shared/broche.png'
                            alt=''
                            width={120}
                            height={95}
                            className='absolute top-[23%] -right-4 z-20 hidden w-32 lg:block'
                            style={{ height: 'auto' }}
                            unoptimized
                          />
                          <div className='relative'>
                            <Image
                              src='/assets/registro/formulario/shared/marco-foto.png'
                              alt='Foto de perfil'
                              width={160}
                              height={200}
                              className='w-32 lg:w-36'
                              style={{ height: 'auto' }}
                              unoptimized
                            />
                            <div className='absolute inset-x-[4%] top-[8%] bottom-[14%] overflow-hidden bg-[#e8b4a8]'>
                              <Image
                                src='/assets/registro/formulario/shared/zona-foto.png'
                                alt='Subir foto'
                                fill
                                className='object-fill opacity-60'
                                unoptimized
                              />
                            </div>
                          </div>
                          <Label className='font-pt-mono mt-1 cursor-pointer text-[10px] font-bold tracking-wider text-black uppercase hover:text-black/70'>
                            Foto de perfil
                            <input
                              type='file'
                              name='photo'
                              accept='image/*'
                              className='hidden'
                            />
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-end pt-2'>
                    <button
                      type='submit'
                      className='cursor-pointer'
                    >
                      <Image
                        src='/assets/registro/formulario/shared/boton-siguiente.png'
                        alt='Siguiente'
                        width={220}
                        height={65}
                        className='w-36 transition-opacity hover:opacity-80 sm:w-44'
                        style={{ height: 'auto' }}
                        unoptimized
                      />
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

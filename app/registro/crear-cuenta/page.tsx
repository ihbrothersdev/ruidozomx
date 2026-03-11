'use client'

import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import type { RegistrationSource, Role } from '@/lib/types'
import { ROLE_LABELS } from '@/lib/types'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { registroSignup } from '../actions'
import { inputCls, labelCls } from './constants'

export default function CrearCuentaPage() {
  return (
    <Suspense>
      <CrearCuentaContent />
    </Suspense>
  )
}

function CrearCuentaContent() {
  const searchParams = useSearchParams()
  const role = (searchParams.get('role') ?? 'fan') as Role
  const source = (searchParams.get('source') ?? 'registro') as RegistrationSource
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  // Read profile data from sessionStorage (saved by formulario step)
  const [profileData, setProfileData] = useState<Record<string, string | string[]>>({})

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('ruidozo_profile')
      if (stored) {
        setProfileData(JSON.parse(stored))
      }
    } catch {
      // sessionStorage not available
    }
  }, [])

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Dark texture background */}
      <Image
        src='/assets/registro/crear-cuenta/textura.png'
        alt=''
        fill
        className='object-cover'
        priority
        unoptimized
      />

      <div className='relative z-10 flex min-h-screen items-center justify-center p-4'>
        <div className='flex w-full max-w-4xl overflow-hidden rounded-sm shadow-2xl'>
          {/* Left red panel */}
          <div className='relative hidden w-2/5 items-center justify-center md:flex'>
            <Image
              src='/assets/registro/crear-cuenta/red-back.png'
              alt=''
              fill
              className='object-cover'
              unoptimized
            />
            <div className='relative z-10 p-8'>
              <Image
                src='/assets/registro/crear-cuenta/logo.png'
                alt='Ruidozo'
                width={300}
                height={200}
                className='w-48'
                style={{ height: 'auto' }}
                unoptimized
              />
            </div>
          </div>

          {/* Right grey panel with form */}
          <div className='relative flex-1'>
            <Image
              src='/assets/registro/crear-cuenta/grey-back.png'
              alt=''
              fill
              className='object-cover'
              unoptimized
            />
            <div className='relative z-10 p-6 sm:p-8'>
              {/* Title */}
              <Image
                src='/assets/registro/crear-cuenta/crea-tu-cuenta.png'
                alt='Crea tu cuenta'
                width={400}
                height={50}
                className='mb-2 w-56 sm:w-64'
                style={{ height: 'auto' }}
                unoptimized
              />
              <p className='font-pt-mono mb-6 text-xs text-black/60'>
                Registrándote como: <strong>{ROLE_LABELS[role]}</strong>
              </p>

              {error && (
                <div className='font-pt-mono mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700'>
                  {error}
                </div>
              )}

              {message && (
                <div className='font-pt-mono mb-4 rounded border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700'>
                  {message}
                </div>
              )}

              {/* Yellow card with form */}
              <div className='relative'>
                <Image
                  src='/assets/registro/crear-cuenta/tarjeta-amarilla.png'
                  alt=''
                  fill
                  className='object-cover'
                  unoptimized
                />
                <form className='relative z-10 space-y-3 p-4 sm:p-6'>
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

                  {/* Inject profile data from sessionStorage as hidden inputs */}
                  {Object.entries(profileData).map(([key, value]) => {
                    // Skip role/source (already in the form)
                    if (key === 'role' || key === 'source' || key === '_genres_required') return null
                    if (Array.isArray(value)) {
                      return value.map((v, i) => (
                        <input
                          key={`${key}-${i}`}
                          type='hidden'
                          name={key}
                          value={v}
                        />
                      ))
                    }
                    return (
                      <input
                        key={key}
                        type='hidden'
                        name={key}
                        value={value}
                      />
                    )
                  })}

                  <div className='space-y-1'>
                    <Label
                      htmlFor='display_name'
                      className={labelCls}
                    >
                      Nombre
                    </Label>
                    <Input
                      id='display_name'
                      name='display_name'
                      type='text'
                      required
                      placeholder='Tu nombre o el de tu banda'
                      className={inputCls}
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='email'
                      className={labelCls}
                    >
                      Email
                    </Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      required
                      placeholder='tu@email.com'
                      className={inputCls}
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='password'
                      className={labelCls}
                    >
                      Contraseña
                    </Label>
                    <Input
                      id='password'
                      name='password'
                      type='password'
                      required
                      minLength={6}
                      placeholder='••••••••'
                      className={inputCls}
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label
                      htmlFor='confirm_password'
                      className={labelCls}
                    >
                      Confirmar contraseña
                    </Label>
                    <Input
                      id='confirm_password'
                      name='confirm_password'
                      type='password'
                      required
                      minLength={6}
                      placeholder='••••••••'
                      className={inputCls}
                    />
                  </div>

                  <div className='flex justify-end pt-2'>
                    <button
                      formAction={registroSignup}
                      className='cursor-pointer'
                    >
                      <Image
                        src='/assets/registro/crear-cuenta/boton-listo.png'
                        alt='Listo'
                        width={140}
                        height={45}
                        className='w-24 transition-opacity hover:opacity-80 sm:w-28'
                        style={{ height: 'auto' }}
                        unoptimized
                      />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

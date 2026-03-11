'use client'

import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import type { RegistrationSource, Role } from '@/lib/types'
import { ROLE_LABELS } from '@/lib/types'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
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
  const serverError = searchParams.get('error')
  const message = searchParams.get('message')

  const [profileData, setProfileData] = useState<Record<string, string | string[]>>({})
  const [clientError, setClientError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const error = clientError || serverError

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value
    const confirm = (form.elements.namedItem('confirm_password') as HTMLInputElement)?.value

    if (password !== confirm) {
      e.preventDefault()
      setClientError('Las contraseñas no coinciden.')
      return
    }

    if (password.length < 6) {
      e.preventDefault()
      setClientError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setClientError(null)
    setIsSubmitting(true)
  }

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
                <div className='font-pt-mono animate-in fade-in mb-4 flex items-start gap-2 rounded-md border-2 border-red-500 bg-red-100 px-4 py-3 text-sm font-bold text-red-800 shadow-md'>
                  <span className='shrink-0 text-lg'>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className='font-pt-mono mb-4 flex items-start gap-2 rounded-md border-2 border-green-500 bg-green-100 px-4 py-3 text-sm font-bold text-green-800 shadow-md'>
                  <span className='shrink-0 text-lg'>✓</span>
                  <span>{message}</span>
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
                <form
                  ref={formRef}
                  action={registroSignup}
                  onSubmit={handleSubmit}
                  className='relative z-10 space-y-3 p-4 sm:p-6'
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
                      type='submit'
                      disabled={isSubmitting}
                      className='cursor-pointer disabled:cursor-wait disabled:opacity-50'
                    >
                      {isSubmitting ? (
                        <span className='font-pt-mono inline-block rounded bg-amber-700 px-6 py-2 text-sm text-white'>
                          Registrando...
                        </span>
                      ) : (
                        <Image
                          src='/assets/registro/crear-cuenta/boton-listo.png'
                          alt='Listo'
                          width={140}
                          height={45}
                          className='w-24 transition-opacity hover:opacity-80 sm:w-28'
                          style={{ height: 'auto' }}
                          unoptimized
                        />
                      )}
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

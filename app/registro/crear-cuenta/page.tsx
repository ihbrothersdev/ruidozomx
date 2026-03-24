'use client'

import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import type { RegistrationSource, Role } from '@/lib/types'
import { ROLE_LABELS } from '@/lib/types'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { sileo } from 'sileo'
import { registroSignup } from '../actions'
import { inputCls, labelCls } from './constants'

// The field that must be present for each role — if missing, the user skipped the form
const REQUIRED_FIELD_BY_ROLE: Record<Role, string> = {
  fan: 'alias',
  banda: 'band_name',
  manager: 'full_name',
  promotor: 'full_name',
  agente: 'full_name',
  proveedor: 'brand_name',
  venue: 'venue_name'
}

const FORM_FIELDS: {
  name: string
  label: string
  type: string
  placeholder: string
  minLength?: number
}[] = [
  { name: 'display_name', label: 'Nombre', type: 'text', placeholder: 'Tu nombre o el de tu banda' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com' },
  { name: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', minLength: 6 },
  {
    name: 'confirm_password',
    label: 'Confirmar contraseña',
    type: 'password',
    placeholder: '••••••••',
    minLength: 6
  }
]

export default function CrearCuentaPage() {
  return (
    <Suspense>
      <CrearCuentaContent />
    </Suspense>
  )
}

function Alert({ variant, children }: { variant: 'error' | 'success'; children: React.ReactNode }) {
  const styles =
    variant === 'error' ? 'border-red-500 bg-red-100 text-red-800' : 'border-green-500 bg-green-100 text-green-800'
  const icon = variant === 'error' ? '⚠' : '✓'

  return (
    <div
      className={`font-pt-mono mb-4 flex items-start gap-2 rounded-md border-2 px-4 py-3 text-sm font-bold shadow-md ${styles}`}
    >
      <span className='shrink-0 text-lg'>{icon}</span>
      <span>{children}</span>
    </div>
  )
}

function HiddenProfileInputs({ data }: { data: Record<string, string | string[]> }) {
  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        if (key === 'role' || key === 'source' || key.startsWith('_')) return null
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
    </>
  )
}

function CrearCuentaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = (searchParams.get('role') ?? 'fan') as Role
  const source = (searchParams.get('source') ?? 'registro') as RegistrationSource
  const serverError = searchParams.get('error')
  const message = searchParams.get('message')

  const [profileData] = useState<Record<string, string | string[]>>(() => {
    try {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem('ruidozo_profile') : null
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Guard: if the role-specific required field is missing, the user skipped the form
  useEffect(() => {
    const requiredField = REQUIRED_FIELD_BY_ROLE[role]
    const value = profileData[requiredField]
    if (!value || (typeof value === 'string' && !value.trim())) {
      router.replace(`/registro/elige-rol?source=${source}&toast=noform`)
    }
  }, [role, source, profileData, router])

  // Show server-side error (from redirect ?error=) as toast
  useEffect(() => {
    if (serverError) {
      sileo.error({ title: 'Error', description: serverError, position: 'top-center' })
    }
  }, [serverError])

  const [clientError, setClientError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const error = clientError

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
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden p-4'>
      <Image
        src='/assets/registro/crear-cuenta/textura.png'
        alt=''
        fill
        className='object-cover'
        priority
        unoptimized
      />

      <section className='relative z-10 flex w-full max-w-4xl rounded-sm shadow-2xl'>
        <aside className='relative hidden w-2/5 items-center justify-center overflow-hidden md:flex'>
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
        </aside>

        <div className='relative flex-1 overflow-hidden'>
          <Image
            src='/assets/registro/crear-cuenta/grey-back.png'
            alt=''
            fill
            className='object-cover'
            unoptimized
          />

          <div className='relative z-10 p-6 sm:p-8'>
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

            {error && <Alert variant='error'>{error}</Alert>}
            {message && <Alert variant='success'>{message}</Alert>}

            <div className='relative overflow-visible'>
              <Image
                src='/assets/registro/crear-cuenta/tarjeta-amarilla.png'
                alt=''
                fill
                className='object-fill'
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
                <HiddenProfileInputs data={profileData} />

                {FORM_FIELDS.map(field => (
                  <div
                    key={field.name}
                    className='space-y-1'
                  >
                    <Label
                      htmlFor={field.name}
                      className={labelCls}
                    >
                      {field.label}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      required
                      placeholder={field.placeholder}
                      minLength={field.minLength}
                      className={inputCls}
                    />
                  </div>
                ))}

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
      </section>
    </main>
  )
}

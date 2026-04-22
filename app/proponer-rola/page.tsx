'use client'

import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { FormField } from './_components/FormField'
import { submitProposal } from './actions'
import { inputCls, labelCls } from './constants'

export default function ProponerRolaPage() {
  return (
    <Suspense>
      <ProponerRolaContent />
    </Suspense>
  )
}

function ProponerRolaContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success') === 'true'
  const limitReached = searchParams.get('limit') === 'true'
  const [accepted, setAccepted] = useState(false)
  const [showModal, setShowModal] = useState(success)

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Red background */}
      <Image
        src='/assets/registro/proponer-rola/red-back.png'
        alt=''
        fill
        className='object-cover'
        priority
        unoptimized
      />

      <div className='relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 sm:px-6'>
        {/* Top nav — right aligned */}
        <div className='mb-4 flex w-full items-start justify-end gap-2'>
          <Link href='/perfil'>
            <Image
              src='/assets/registro/proponer-rola/boton-mi-cuenta.png'
              alt='Mi Cuenta'
              width={140}
              height={40}
              className='w-24 transition-opacity hover:opacity-80 sm:w-28'
              style={{ height: 'auto' }}
              unoptimized
            />
          </Link>
          <Link href='/'>
            <Image
              src='/assets/registro/proponer-rola/boton-home.png'
              alt='Casete actual'
              width={140}
              height={40}
              className='w-24 transition-opacity hover:opacity-80 sm:w-28'
              style={{ height: 'auto' }}
              unoptimized
            />
          </Link>
        </div>

        {/* Grey folder form */}
        <div className='relative w-full flex-1'>
          <Image
            src='/assets/registro/proponer-rola/folder-gris.png'
            alt=''
            fill
            className='object-fill'
            unoptimized
          />

          <div className='relative z-10 p-6 sm:p-8 lg:p-10'>
            {/* Etiqueta ROLA */}
            <Image
              src='/assets/registro/proponer-rola/etiqueta-rola.png'
              alt='Rola'
              width={140}
              height={50}
              className='mb-6 w-24 sm:w-28'
              style={{ height: 'auto' }}
              unoptimized
            />

            {error && (
              <div className='font-pt-mono mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700'>
                {error}
              </div>
            )}

            <form className='space-y-5'>
              <FormField
                label='Nombre proyecto'
                name='artist'
                required
              />
              <FormField
                label='Nombre de la rola'
                name='title'
              />
              <FormField
                label='Link público'
                name='external_link'
                required
              />
              <FormField
                label='Correo de contacto'
                name='contact_email'
                required
                type='email'
              />
              <FormField
                label='Comentario opcional'
                name='comment'
                textarea
              />

              {/* Link privado section */}
              <div className='space-y-1 pt-2'>
                <Label className={labelCls}>Link privado para descargar el material</Label>
                <p className='font-pt-mono text-[11px] font-bold tracking-wider text-black uppercase'>
                  Asegurate de que el enlace tenga permisos abiertos*
                </p>
                <Input
                  name='audio_file_path'
                  type='url'
                  placeholder='Dropbox, Drive, WeTransfer, otro'
                  className={inputCls}
                />
              </div>

              {/* Rights checkbox */}
              <div className='flex cursor-pointer items-start gap-2.5 pt-2'>
                <Checkbox
                  id='accept-rights'
                  checked={accepted}
                  onCheckedChange={checked => setAccepted(checked === true)}
                  className='mt-0.5 h-5 w-5 rounded-none border-2 border-black/40 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                />
                <Label
                  htmlFor='accept-rights'
                  className='font-pt-mono cursor-pointer text-xs leading-relaxed tracking-wide text-black uppercase'
                >
                  Confirmo que soy titular de los derechos o cuento con autorización para compartir esta música, y
                  autorizo su reproducción dentro del cassette de Ru!dozo.
                </Label>
              </div>

              {/* Submit button */}
              <div className='flex justify-end pt-2'>
                <button
                  formAction={submitProposal}
                  disabled={!accepted || limitReached}
                  className='cursor-pointer disabled:cursor-not-allowed'
                >
                  <Image
                    src={
                      limitReached
                        ? '/assets/registro/proponer-rola/boton-proponer-rola-hover.png'
                        : '/assets/registro/proponer-rola/boton-proponer-rola.png'
                    }
                    alt='Proponer rola'
                    width={200}
                    height={100}
                    className={`w-28 transition-opacity sm:w-36 ${!accepted || limitReached ? 'opacity-50' : 'hover:opacity-90'}`}
                    style={{ height: 'auto' }}
                    unoptimized
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success modal overlay */}
      {showModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          onClick={() => setShowModal(false)}
        >
          <div
            className='relative max-w-lg cursor-default'
            onClick={e => e.stopPropagation()}
          >
            <Image
              src='/assets/registro/proponer-rola/modal-revision-propuesta.png'
              alt='Tu propuesta ya está en revisión'
              width={600}
              height={400}
              className='w-full'
              style={{ height: 'auto' }}
              unoptimized
            />
            <div className='mt-4 flex justify-center'>
              <Link
                href='/'
                className='font-pt-mono rounded-sm bg-red-600 px-6 py-2.5 text-sm font-bold tracking-wider text-white uppercase shadow-md transition-colors hover:bg-red-500'
              >
                Ir al cassette
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

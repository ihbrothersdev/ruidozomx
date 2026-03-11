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
  const [accepted, setAccepted] = useState(false)

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

      <div className='relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center px-4 py-6'>
        {/* Top nav */}
        <div className='mb-4 flex w-full items-center justify-between'>
          <div />
          <div className='flex gap-2'>
            <Link href='/dashboard'>
              <Image
                src='/assets/registro/proponer-rola/boton-mi-cuenta.png'
                alt='Mi Cuenta'
                width={120}
                height={30}
                className='w-20 transition-opacity hover:opacity-80'
                style={{ height: 'auto' }}
                unoptimized
              />
            </Link>
            <Link href='/'>
              <Image
                src='/assets/registro/proponer-rola/boton-home.png'
                alt='Home'
                width={80}
                height={30}
                className='w-14 transition-opacity hover:opacity-80'
                style={{ height: 'auto' }}
                unoptimized
              />
            </Link>
          </div>
        </div>

        {/* Grey folder form */}
        <div className='relative w-full'>
          <Image
            src='/assets/registro/proponer-rola/folder-gris.png'
            alt=''
            fill
            className='object-cover'
            unoptimized
          />

          <div className='relative z-10 p-6 sm:p-10'>
            {/* Etiqueta ROLA */}
            <Image
              src='/assets/registro/proponer-rola/etiqueta-rola.png'
              alt='Rola'
              width={120}
              height={40}
              className='mb-6 w-20'
              style={{ height: 'auto' }}
              unoptimized
            />

            {error && (
              <div className='font-pt-mono mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700'>
                {error}
              </div>
            )}

            {success ? (
              <div className='flex flex-col items-center gap-6 py-8'>
                <Image
                  src='/assets/registro/proponer-rola/modal-revision-propuesta.png'
                  alt='Tu propuesta ya está en revisión'
                  width={400}
                  height={200}
                  className='w-64 sm:w-80'
                  style={{ height: 'auto' }}
                  unoptimized
                />
                <p className='font-pt-mono text-center text-sm text-black/70'>
                  Te notificaremos cuando tu propuesta sea revisada.
                </p>
                <div className='flex gap-3'>
                  <Link
                    href='/proponer-rola'
                    className='font-pt-mono rounded bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-600'
                  >
                    Proponer otra rola
                  </Link>
                  <Link
                    href='/'
                    className='font-pt-mono rounded bg-black px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-black/80'
                  >
                    Ir al inicio
                  </Link>
                </div>
              </div>
            ) : (
              <form className='space-y-4'>
                <div className='flex flex-col gap-6 md:flex-row'>
                  <div className='flex-1 space-y-4'>
                    <FormField
                      label='Nombre proyecto'
                      name='artist'
                      required
                      placeholder='Nombre de tu banda o proyecto'
                    />
                    <FormField
                      label='Nombre de la rola'
                      name='title'
                      required
                      placeholder='Título de la canción'
                    />
                    <FormField
                      label='Género'
                      name='genre'
                      placeholder='Rock, Electrónica, Hip Hop...'
                    />
                    <FormField
                      label='Link público'
                      name='external_link'
                      required
                      placeholder='Spotify, YouTube, SoundCloud...'
                    />
                    <FormField
                      label='Correo de contacto'
                      name='contact_email'
                      required
                      type='email'
                      placeholder='tu@email.com'
                    />
                    <FormField
                      label='Comentario opcional'
                      name='comment'
                      placeholder='Algo que quieras agregar...'
                      textarea
                    />
                  </div>

                  <div className='hidden shrink-0 md:block'>
                    <Image
                      src='/assets/registro/proponer-rola/rola-casete.jpg'
                      alt='Cassette'
                      width={280}
                      height={400}
                      className='w-52 rounded'
                      style={{ height: 'auto' }}
                      unoptimized
                    />
                  </div>
                </div>

                <div className='border-t border-black/10 pt-4'>
                  <Label className={labelCls}>Link privado para descargar el material</Label>
                  <p className='font-pt-mono mb-2 text-[9px] text-black/50'>
                    Asegúrate de que el enlace tenga permisos abiertos*
                  </p>
                  <Input
                    name='audio_file_path'
                    type='url'
                    placeholder='Dropbox, Drive, WeTransfer, otro'
                    className={inputCls}
                  />
                </div>

                <div className='flex cursor-pointer items-start gap-2 pt-2'>
                  <Checkbox
                    id='accept-rights'
                    checked={accepted}
                    onCheckedChange={checked => setAccepted(checked === true)}
                    className='mt-0.5 border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                  />
                  <Label
                    htmlFor='accept-rights'
                    className='font-pt-mono cursor-pointer text-[10px] leading-tight text-black/70'
                  >
                    Confirmo que soy titular de los derechos o cuento con autorización para compartir esta música, y
                    autorizo su reproducción dentro del cassette de Ruidozo.
                  </Label>
                </div>

                <div className='flex justify-end pt-2'>
                  <button
                    formAction={submitProposal}
                    disabled={!accepted}
                    className='cursor-pointer disabled:cursor-not-allowed disabled:opacity-40'
                  >
                    <Image
                      src='/assets/registro/proponer-rola/boton-proponer-rola.png'
                      alt='Proponer rola'
                      width={200}
                      height={100}
                      className='w-28 transition-opacity hover:opacity-80 sm:w-36'
                      style={{ height: 'auto' }}
                      unoptimized
                    />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

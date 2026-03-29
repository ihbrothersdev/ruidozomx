/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { login } from '../actions'
import { ErrorToast } from './ErrorToast'

const inputCls =
  'font-pt-mono w-full border-2 border-red-600 bg-transparent px-4 py-2.5 text-sm text-black placeholder:text-black/30 focus:border-red-700 focus:outline-none'

export default async function LoginPage() {
  return (
    <div className='flex min-h-screen'>
      <Suspense>
        <ErrorToast />
      </Suspense>

      {/* Left column — red with logo */}
      <aside className='relative hidden w-2/5 items-center justify-center overflow-hidden md:flex'>
        <Image
          src='/assets/iniciar-sesion/red-back.png'
          alt=''
          fill
          className='object-cover'
          priority
          unoptimized
        />
        <Image
          src='/assets/iniciar-sesion/textura-red.png'
          alt=''
          fill
          className='object-cover opacity-30 mix-blend-multiply'
          unoptimized
        />
        <div className='relative z-10'>
          <Image
            src='/assets/iniciar-sesion/logo.png'
            alt='Ruidozo'
            width={400}
            height={260}
            className='w-56 lg:w-72'
            style={{ height: 'auto' }}
            unoptimized
          />
        </div>
      </aside>

      <main className='relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-10'>
        <Image
          src='/assets/iniciar-sesion/grey-back.png'
          alt=''
          fill
          className='object-cover'
          priority
          unoptimized
        />

        <div className='relative z-10 flex w-full max-w-lg flex-col items-center'>
          <div className='flex flex-col items-center pb-10'>
            <Image
              src='/assets/iniciar-sesion/iniciar.png'
              alt='Iniciar'
              width={600}
              height={100}
              className='w-72 sm:w-96'
              style={{ height: 'auto' }}
              unoptimized
            />
            <Image
              src='/assets/iniciar-sesion/sesion.png'
              alt='Sesión'
              width={600}
              height={100}
              className='-mt-3 w-56 sm:w-72'
              style={{ height: 'auto' }}
              unoptimized
            />
          </div>

          <div className='relative w-full overflow-visible'>
            <Image
              src='/assets/iniciar-sesion/ticket.png'
              alt=''
              fill
              className='object-fill'
              unoptimized
            />

            <form className='relative z-10 space-y-5 px-8 py-8 sm:px-12 sm:py-10'>
              <div className='flex items-center gap-4'>
                <label
                  htmlFor='email'
                  className='font-pt-mono w-32 shrink-0 text-right text-xs font-bold tracking-wider text-black uppercase'
                >
                  Email
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  required
                  placeholder='tu@email.com'
                  className={inputCls}
                />
              </div>

              <div className='flex items-center gap-4'>
                <label
                  htmlFor='password'
                  className='font-pt-mono w-32 shrink-0 text-right text-xs font-bold tracking-wider text-black uppercase'
                >
                  Contraseña
                </label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  required
                  minLength={6}
                  placeholder='••••••••'
                  className={inputCls}
                />
              </div>

              {/* Entrar button */}
              <div className='flex justify-end pt-1'>
                <button
                  formAction={login}
                  className='relative h-12 w-32 cursor-pointer overflow-hidden transition-transform hover:scale-[1.02] active:scale-95'
                >
                  <img
                    src='/assets/registro/explicacion-rol/shared/boton-crear-perfil.png'
                    alt=''
                    className='absolute inset-0 h-full w-full object-cover'
                  />
                  <span className='font-baby-doll relative z-10 flex h-full items-center justify-center text-base font-bold tracking-[0.15em] text-white uppercase'>
                    Entrar
                  </span>
                </button>
              </div>
            </form>
          </div>

          <p className='font-pt-mono mt-8 text-center text-sm text-black/60'>
            ¿No tienes cuenta?{' '}
            <Link
              href='/registro/elige-rol'
              className='font-bold text-red-600 underline underline-offset-4 hover:text-red-700'
            >
              Regístrate
            </Link>
          </p>

          <Link
            href='/'
            className='font-pt-mono mt-5 rounded-sm bg-neutral-800 px-8 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-neutral-700'
          >
            Volver
          </Link>
        </div>
      </main>
    </div>
  )
}

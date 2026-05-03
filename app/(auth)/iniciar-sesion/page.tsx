import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { ErrorToast } from './ErrorToast'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Ingresa a tu cuenta de Ruidozo MX para proponer rolas, conectar con la comunidad y compartir tu música.'
}

export default async function LoginPage() {
  return (
    <div className='flex min-h-screen flex-col md:flex-row'>
      <Suspense>
        <ErrorToast />
      </Suspense>

      <div
        className='relative h-48 w-full overflow-hidden md:hidden'
        style={{ background: 'linear-gradient(to bottom, #D7716C, #C94139)' }}
      >
        <Image
          src='/assets/iniciar-sesion/textura-red.png'
          alt=''
          fill
          className='object-cover opacity-45 mix-blend-screen'
        />
        <Image
          src='/assets/iniciar-sesion/mobile-top.png'
          alt=''
          fill
          className='object-cover opacity-45 mix-blend-screen'
          priority
        />
      </div>

      <aside
        className='relative hidden w-2/5 items-center justify-center overflow-hidden md:flex'
        style={{ background: 'linear-gradient(to bottom, #D7716C, #C94139)' }}
      >
        <Image
          src='/assets/iniciar-sesion/textura-red.png'
          alt=''
          fill
          className='object-cover opacity-45 mix-blend-screen'
        />
        <div className='relative z-10'>
          <Image
            src='/assets/iniciar-sesion/logo.png'
            alt='Ruidozo'
            width={400}
            height={260}
            className='w-56 lg:w-72'
            style={{ height: 'auto' }}
          />
        </div>
      </aside>

      <main className='relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-10'>
        <Image
          src='/assets/iniciar-sesion/grey-back.png'
          alt=''
          fill
          className='hidden object-cover md:block'
          priority
        />
        <Image
          src='/assets/iniciar-sesion/grey-back.png'
          alt=''
          fill
          className='object-cover md:hidden'
          priority
        />
        <Image
          src='/assets/iniciar-sesion/mobile-textura.png'
          alt=''
          fill
          className='object-cover opacity-15 md:hidden'
        />

        <div className='relative z-10 flex w-full max-w-lg flex-col items-center'>
          <div className='flex items-baseline gap-3 pb-2'>
            <Image
              src='/assets/iniciar-sesion/iniciar.png'
              alt='Iniciar'
              width={600}
              height={100}
              className='w-40 sm:w-52 md:w-60'
              style={{ height: 'auto' }}
            />
            <Image
              src='/assets/iniciar-sesion/sesion.png'
              alt='Sesión'
              width={600}
              height={100}
              className='w-40 sm:w-52 md:w-60'
              style={{ height: 'auto' }}
            />
          </div>

          <p className='font-pt-mono pb-8 text-xs font-bold tracking-[0.2em] text-red-600 uppercase'>
            Ingresa tus credenciales
          </p>

          <div className='relative w-full overflow-visible'>
            <Image
              src='/assets/iniciar-sesion/ticket.png'
              alt=''
              fill
              className='object-fill'
            />

            <LoginForm />
          </div>

          <div className='font-pt-mono mt-8 text-center text-[20px] font-bold tracking-wider uppercase'>
            <p>
              <span className='text-black'>¿No tienes cuenta? </span>
              <Link
                href='/registro/elige-rol'
                className='underline underline-offset-4 hover:opacity-80'
                style={{ color: '#C7352E' }}
              >
                Regístrate
              </Link>
            </p>
            <p className='mt-2'>
              <ForgotPasswordModal />
            </p>
          </div>

          <Link
            href='/'
            className='font-pt-mono mt-6 rounded-sm bg-neutral-800 px-8 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-neutral-700'
          >
            Volver
          </Link>
        </div>
      </main>

      <div
        className='relative flex h-48 w-full items-center justify-center overflow-hidden md:hidden'
        style={{ background: 'linear-gradient(to bottom, #C94139, #D7716C)' }}
      >
        <Image
          src='/assets/iniciar-sesion/textura-red.png'
          alt=''
          fill
          className='object-cover opacity-45 mix-blend-screen'
        />
        <div className='relative z-10'>
          <Image
            src='/assets/iniciar-sesion/logo.png'
            alt='Ruidozo'
            width={400}
            height={260}
            className='w-40'
            style={{ height: 'auto' }}
          />
        </div>
      </div>
    </div>
  )
}

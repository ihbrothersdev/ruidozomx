/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import Link from 'next/link'
import { login } from '../actions'
import { type AuthSearchParams } from '../types'

export default async function LoginPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const { error, message } = await searchParams

  return (
    <div className='relative flex min-h-screen w-screen items-center justify-center overflow-hidden'>
      {/* Fondo papel */}
      <div className='absolute inset-0 z-0'>
        <Image
          src='/assets/registro/explicacion-rol/shared/fondo.png'
          alt=''
          fill
          className='object-cover'
          priority
          unoptimized
        />
      </div>

      {/* Card central */}
      <div className='relative z-10 flex w-full max-w-md flex-col items-center gap-6 px-6 py-10'>
        {/* Rayo + Título */}
        <div className='flex flex-col items-center gap-3'>
          <img
            src='/assets/registro/explicacion-rol/shared/rayo.png'
            alt=''
            className='h-16 w-auto'
          />
          <h1 className='font-baby-doll text-center text-[clamp(2.5rem,6vw,4rem)] leading-[0.9] font-black text-black uppercase'>
            Iniciar
            <br />
            Sesión
          </h1>
          <p className='font-pt-mono text-center text-sm font-bold text-black/60 uppercase'>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className='font-pt-mono w-full rounded border border-red-300 bg-red-50/80 px-4 py-3 text-sm text-red-700'>
            {error}
          </div>
        )}
        {message && (
          <div className='font-pt-mono w-full rounded border border-green-300 bg-green-50/80 px-4 py-3 text-sm text-green-700'>
            {message}
          </div>
        )}

        {/* Formulario */}
        <form className='flex w-full flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <label
              htmlFor='email'
              className='font-pt-mono text-xs font-bold tracking-wider text-black/70 uppercase'
            >
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              required
              placeholder='tu@email.com'
              className='font-pt-mono rounded border-2 border-black/20 bg-white/60 px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-black/60 focus:outline-none'
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label
              htmlFor='password'
              className='font-pt-mono text-xs font-bold tracking-wider text-black/70 uppercase'
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
              className='font-pt-mono rounded border-2 border-black/20 bg-white/60 px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-black/60 focus:outline-none'
            />
          </div>

          {/* Botón Entrar — usa el estilo del botón rojo */}
          <button
            formAction={login}
            className='relative mt-2 h-14 w-full cursor-pointer overflow-hidden transition-transform hover:scale-[1.02] active:scale-95'
          >
            <img
              src='/assets/registro/explicacion-rol/shared/boton-crear-perfil.png'
              alt=''
              className='absolute inset-0 h-full w-full object-cover'
            />
            <span className='font-baby-doll relative z-10 flex h-full items-center justify-center text-lg font-bold tracking-[0.15em] text-white uppercase'>
              Entrar
            </span>
          </button>
        </form>

        {/* Link a registro */}
        <p className='font-pt-mono text-center text-sm text-black/60'>
          ¿No tienes cuenta?{' '}
          <Link
            href='/registro/elige-rol'
            className='font-bold text-red-600 underline underline-offset-4'
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

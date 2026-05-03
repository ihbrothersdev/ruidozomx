import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { PasswordInput } from '@/app/components/ui/password-input'
import type { Metadata } from 'next'
import Link from 'next/link'
import { signup } from '../actions'
import { type AuthSearchParams } from '../types'

export const metadata: Metadata = {
  title: 'Regístrate',
  description: 'Crea tu cuenta en Ruidozo MX y forma parte de la trinchera musical mexicana.'
}

export default async function SignupPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const { error, message } = await searchParams

  return (
    <div className='flex min-h-screen items-center justify-center bg-[#0a0a0a] bg-[url("/assets/textura/background-textura.jpg")] bg-cover bg-center px-4'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='text-center'>
          <h1 className='font-baby-doll text-3xl text-white'>Crear Cuenta</h1>
          <p className='font-pt-mono mt-1 text-sm text-gray-400'>Regístrate para comenzar</p>
        </div>

        {error && (
          <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</div>
        )}

        {message && (
          <div className='rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
            {message}
          </div>
        )}

        <form className='space-y-4'>
          <div className='space-y-1'>
            <Label
              htmlFor='email'
              className='text-sm font-medium text-white'
            >
              Email
            </Label>
            <Input
              id='email'
              name='email'
              type='email'
              required
              placeholder='tu@email.com'
              className='border-gray-700 bg-gray-900 text-white placeholder:text-gray-500 focus-visible:border-white focus-visible:ring-0'
            />
          </div>

          <div className='space-y-1'>
            <Label
              htmlFor='password'
              className='text-sm font-medium text-white'
            >
              Contraseña
            </Label>
            <PasswordInput
              id='password'
              name='password'
              required
              minLength={6}
              placeholder='••••••••'
              className='h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-base text-white shadow-xs focus-within:border-white md:text-sm'
              inputClassName='placeholder:text-gray-500'
              toggleClassName='shrink-0 text-gray-400 transition-colors hover:text-white focus:outline-none disabled:opacity-50'
            />
          </div>

          <Button
            formAction={signup}
            className='w-full cursor-pointer bg-white text-black hover:bg-white/90'
          >
            Registrarse
          </Button>
        </form>

        <p className='text-center text-sm text-gray-500'>
          Ya tienes cuenta?{' '}
          <Link
            href='/iniciar-sesion'
            className='font-medium text-white underline underline-offset-4'
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

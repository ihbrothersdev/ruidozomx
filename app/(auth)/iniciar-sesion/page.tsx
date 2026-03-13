import Link from 'next/link'
import { login } from '../actions'
import { type AuthSearchParams } from '../types'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'

export default async function LoginPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const { error, message } = await searchParams

  return (
    <div className='flex min-h-screen items-center justify-center bg-[#0a0a0a] bg-[url("/assets/textura/background-textura.jpg")] bg-cover bg-center px-4'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='text-center'>
          <h1 className='font-baby-doll text-3xl text-white'>Iniciar Sesión</h1>
          <p className='font-pt-mono mt-1 text-sm text-gray-400'>Ingresa tus credenciales para continuar</p>
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
            <Input
              id='password'
              name='password'
              type='password'
              required
              minLength={6}
              placeholder='••••••••'
              className='border-gray-700 bg-gray-900 text-white placeholder:text-gray-500 focus-visible:border-white focus-visible:ring-0'
            />
          </div>

          <Button
            formAction={login}
            className='w-full cursor-pointer bg-white text-black hover:bg-white/90'
          >
            Entrar
          </Button>
        </form>

        <p className='text-center text-sm text-gray-500'>
          No tienes cuenta?{' '}
          <Link
            href='/registro/elige-rol'
            className='font-medium text-red-500 underline underline-offset-4'
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

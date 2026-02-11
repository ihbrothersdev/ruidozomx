import Link from 'next/link'
import { login } from '../actions'
import { type AuthSearchParams } from '../types'

export default async function LoginPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const { error, message } = await searchParams

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Iniciar Sesion</h1>
          <p className='mt-1 text-sm text-gray-500'>Ingresa tus credenciales para continuar</p>
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
          <div>
            <label
              htmlFor='email'
              className='mb-1 block text-sm font-medium'
            >
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              required
              placeholder='tu@email.com'
              className='focus:border-foreground w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none dark:border-gray-700 dark:bg-gray-900'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='mb-1 block text-sm font-medium'
            >
              Contrasena
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              minLength={6}
              placeholder='••••••••'
              className='focus:border-foreground w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none dark:border-gray-700 dark:bg-gray-900'
            />
          </div>

          <button
            formAction={login}
            className='bg-foreground text-background w-full cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90'
          >
            Entrar
          </button>
        </form>

        <p className='text-center text-sm text-gray-500'>
          No tienes cuenta?{' '}
          <Link
            href='/signup'
            className='text-foreground font-medium underline underline-offset-4'
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}

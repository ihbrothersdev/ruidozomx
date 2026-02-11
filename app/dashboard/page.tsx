import { createClient } from '@/lib/supabase/server'
import { signout } from '../(auth)/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // user is guaranteed by the proxy redirect — see lib/supabase/proxy.ts
  if (!user) throw new Error('Unexpected: no authenticated user in /dashboard')

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='border-b border-gray-200 dark:border-gray-800'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-4'>
          <h1 className='text-lg font-bold'>Ruidozo MX</h1>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-500'>{user.email}</span>
            <form>
              <button
                formAction={signout}
                className='cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className='mx-auto w-full max-w-5xl flex-1 px-4 py-8'>
        <h2 className='text-2xl font-bold'>Dashboard</h2>
        <p className='mt-2 text-gray-500'>Bienvenido, {user.email}</p>

        <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-lg border border-gray-200 p-6 dark:border-gray-800'>
            <h3 className='font-semibold'>Tu cuenta</h3>
            <p className='mt-1 text-sm text-gray-500'>
              Creada el{' '}
              {new Date(user.created_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className='rounded-lg border border-gray-200 p-6 dark:border-gray-800'>
            <h3 className='font-semibold'>Proveedor</h3>
            <p className='mt-1 text-sm text-gray-500'>{user.app_metadata.provider ?? 'email'}</p>
          </div>

          <div className='rounded-lg border border-gray-200 p-6 dark:border-gray-800'>
            <h3 className='font-semibold'>ID de usuario</h3>
            <p className='mt-1 truncate text-sm text-gray-500'>{user.id}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

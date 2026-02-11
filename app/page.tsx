import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return (
    <div className='flex h-screen flex-col items-center justify-center gap-6'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold'>Ruidozo MX</h1>
        <p className='m-2 text-gray-500 italic'>By IH</p>
      </div>

      <div className='flex gap-3'>
        {user ? (
          <Link
            href='/dashboard'
            className='bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90'
          >
            Ir al Dashboard
          </Link>
        ) : (
          <>
            <Link
              href='/login'
              className='bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90'
            >
              Iniciar Sesion
            </Link>
            <Link
              href='/signup'
              className='rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

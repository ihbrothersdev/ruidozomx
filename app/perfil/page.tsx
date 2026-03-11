import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signout } from '../(auth)/actions'

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/iniciar-sesion')
  }

  // Try to load profile data
  let profile = null
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  } catch {
    // profiles table may not exist yet
  }

  const createdAt = new Date(user.created_at).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className='relative min-h-screen'>
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10 mx-auto max-w-2xl px-4 py-8'>
        {/* Back to home */}
        <Link
          href='/'
          className='font-pt-mono mb-6 inline-flex items-center gap-1 text-sm text-black/60 hover:text-black'
        >
          &larr; Volver al inicio
        </Link>

        {/* Profile card */}
        <div className='relative mt-4 overflow-hidden rounded-sm border-2 border-black/10 bg-white/80 shadow-md backdrop-blur-sm'>
          {/* Red header strip */}
          <div className='bg-red-600 px-6 py-4'>
            <h1 className='font-baby-doll text-2xl tracking-wider text-white'>MI PERFIL</h1>
          </div>

          <div className='space-y-6 p-6'>
            {/* User info */}
            <div className='space-y-3'>
              <div>
                <span className='font-pt-mono text-[11px] font-bold tracking-wider text-black/50 uppercase'>Email</span>
                <p className='font-pt-mono text-sm text-black'>{user.email}</p>
              </div>

              {profile?.display_name && (
                <div>
                  <span className='font-pt-mono text-[11px] font-bold tracking-wider text-black/50 uppercase'>
                    Nombre
                  </span>
                  <p className='font-pt-mono text-sm text-black'>{profile.display_name}</p>
                </div>
              )}

              {profile?.role && (
                <div>
                  <span className='font-pt-mono text-[11px] font-bold tracking-wider text-black/50 uppercase'>Rol</span>
                  <p className='font-pt-mono text-sm text-black capitalize'>{profile.role}</p>
                </div>
              )}

              <div>
                <span className='font-pt-mono text-[11px] font-bold tracking-wider text-black/50 uppercase'>
                  Miembro desde
                </span>
                <p className='font-pt-mono text-sm text-black'>{createdAt}</p>
              </div>

              {profile?.country && (
                <div>
                  <span className='font-pt-mono text-[11px] font-bold tracking-wider text-black/50 uppercase'>
                    Ubicación
                  </span>
                  <p className='font-pt-mono text-sm text-black'>
                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className='border-t border-black/10 pt-4'>
              <h2 className='font-pt-mono mb-3 text-xs font-bold tracking-wider text-black/50 uppercase'>Acciones</h2>
              <div className='flex flex-wrap gap-3'>
                <Link
                  href='/proponer-rola'
                  className='font-pt-mono rounded-sm bg-orange-500 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-orange-600'
                >
                  Proponer rola
                </Link>
                <Link
                  href='/registro/elige-rol'
                  className='font-pt-mono rounded-sm border-2 border-black/20 px-4 py-2 text-xs font-bold tracking-wider text-black uppercase transition-colors hover:bg-black/5'
                >
                  Editar registro
                </Link>
              </div>
            </div>

            {/* Logout */}
            <div className='border-t border-black/10 pt-4'>
              <form>
                <button
                  formAction={signout}
                  className='font-pt-mono cursor-pointer text-xs font-bold tracking-wider text-red-600 uppercase transition-colors hover:text-red-800'
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

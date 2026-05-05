import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { NewPasswordForm } from './NewPasswordForm'

export default async function NuevaContrasenaPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/iniciar-sesion')
  }

  return (
    <div className='flex min-h-screen flex-col md:flex-row'>
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
          className='object-cover'
          priority
        />

        <div className='relative z-10 flex w-full max-w-lg flex-col items-center'>
          <h1 className='font-baby-doll text-[clamp(2rem,5vw,3.5rem)] leading-[0.9] font-black text-black uppercase'>
            Nueva contraseña
          </h1>

          <p className='font-pt-mono mt-3 pb-8 text-xs font-bold tracking-[0.2em] text-red-600 uppercase'>
            Ingresa tu nueva contraseña
          </p>

          <div className='relative w-full overflow-visible'>
            <Image
              src='/assets/iniciar-sesion/ticket.png'
              alt=''
              fill
              className='object-fill'
            />

            <NewPasswordForm />
          </div>
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

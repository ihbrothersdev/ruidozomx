import Image from 'next/image'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { signout } from '@/app/(auth)/actions'

interface FooterProps {
  user?: User | null
}

export function Footer({ user }: FooterProps) {
  return (
    <footer className='relative z-10 mt-8 px-4 py-12 text-yellow-100 md:px-8'>
      <div className='mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:gap-12'>
        {/* Left column - Info */}
        <div className='font-pt-mono flex-1 text-center md:text-left'>
          <h3 className='mb-3 text-2xl tracking-wider uppercase'>Información</h3>
          <ul className='space-y-1.5 text-xl'>
            <li>
              <Link
                href='/archivos/politica_privacidad.pdf'
                target='_blank'
                className='transition-colors hover:text-gray-200'
              >
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link
                href='/archivos/aviso_legal.pdf'
                target='_blank'
                className='transition-colors hover:text-gray-200'
              >
                Aviso Legal
              </Link>
            </li>
            <li>
              <Link
                href='/archivos/cookies.pdf'
                target='_blank'
                className='transition-colors hover:text-gray-200'
              >
                Política de Cookies
              </Link>
            </li>
          </ul>

          <h3 className='font-pt-mono mt-6 mb-3 text-2xl tracking-wider uppercase'>Usuario</h3>
          <ul className='space-y-1.5 text-xl'>
            {user ? (
              <>
                <li>
                  <Link
                    href='/perfil'
                    className='transition-colors hover:text-gray-200'
                  >
                    Mi Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    href='/proponer-rola'
                    className='transition-colors hover:text-gray-200'
                  >
                    Proponer rola
                  </Link>
                </li>
                <li>
                  <form>
                    <button
                      formAction={signout}
                      className='cursor-pointer text-xl transition-colors hover:text-gray-200'
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href='/registro/elige-rol'
                    className='transition-colors hover:text-gray-200'
                  >
                    Regístrate
                  </Link>
                </li>
                <li>
                  <Link
                    href='/iniciar-sesion'
                    className='transition-colors hover:text-gray-200'
                  >
                    Inicia sesión
                  </Link>
                </li>
                <li>
                  <Link
                    href='/iniciar-sesion'
                    className='transition-colors hover:text-gray-200'
                  >
                    ¿Olvidaste la contraseña?
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Right column - Info */}
        <div className='font-pt-mono flex-1 text-center md:text-left'>
          <h3 className='mb-3 text-2xl tracking-wider uppercase'>Navegación</h3>
          <ul className='space-y-1.5 text-xl'>
            <li>
              <Link
                href='/comunidad'
                className='transition-colors hover:text-gray-200'
              >
                Bandas
              </Link>
            </li>
            <li>
              <Link
                href='/comunidad'
                className='transition-colors hover:text-gray-200'
              >
                Fans
              </Link>
            </li>
            <li>
              <Link
                href='/comunidad'
                className='transition-colors hover:text-gray-200'
              >
                Managers
              </Link>
            </li>
            <li>
              <Link
                href='/comunidad'
                className='transition-colors hover:text-gray-200'
              >
                Venues
              </Link>
            </li>
            <li>
              <Link
                href='/comunidad'
                className='transition-colors hover:text-gray-200'
              >
                Proveedores
              </Link>
            </li>
          </ul>
        </div>

        {/* Nuestra religion collage */}
        <div className='hidden flex-1 lg:block'>
          <Image
            src='/assets/body3/nuestra-religion.png'
            alt='Nuestra religión es la música'
            width={1024}
            height={1536}
            className='w-full max-w-[500px]'
            unoptimized
          />
        </div>
      </div>

      {/* Social media */}
      <div className='mx-auto mt-10 max-w-5xl text-center'>
        <p className='font-baby-doll mb-4 text-4xl tracking-wider text-yellow-100 uppercase'>Síguenos en</p>
        <div className='flex items-center justify-center gap-6'>
          <Link
            href='https://www.facebook.com/Ruidozoxx'
            target='_blank'
            className='transition-opacity hover:opacity-80'
          >
            <Image
              src='/assets/body3/facebook.png'
              alt='Facebook'
              width={120}
              height={219}
              className='h-20 w-auto'
              unoptimized
            />
          </Link>
          <Link
            href='https://www.instagram.com/ruidozoxx?igsh=MTJ6dGg4cjEwOWxwdQ=='
            target='_blank'
            className='transition-opacity hover:opacity-80'
          >
            <Image
              src='/assets/body3/instagram.png'
              alt='Instagram'
              width={210}
              height={212}
              className='h-20 w-auto'
              unoptimized
            />
          </Link>
        </div>
      </div>

      {/* Bottom strip */}
      <div className='mx-auto mt-20 flex max-w-5xl items-center justify-center gap-4 sm:gap-8 flex-col sm:flex-row'>
        <Link href='mailto:donadiexx@yahoo.com.mx' className='flex items-center gap-2'>
          <Image
            src='/assets/body3/correo.png'
            alt=''
            width={379}
            height={63}
            className='h-6 sm:h-8 w-auto'
            unoptimized
          />
          <span className='relative inline-block'>
            <Image src='/assets/body3/cuadro-datos.png' alt='' width={200} height={40} className='h-9 sm:h-12 w-auto' unoptimized />
            <span className='font-baby-doll absolute inset-0 flex items-center justify-center text-sm sm:text-lg text-black'>donadiexx@yahoo.com.mx</span>
          </span>
        </Link>
        <Link
          href='https://wa.me/5215611912788'
          target='_blank'
          className='flex items-center gap-2'
        >
          <Image
            src='/assets/body3/whatsapp.png'
            alt=''
            width={379}
            height={63}
            className='h-6 sm:h-8 w-auto'
            unoptimized
          />
          <span className='relative inline-block'>
            <Image src='/assets/body3/cuadro-datos.png' alt='' width={200} height={40} className='h-9 sm:h-12 w-auto' unoptimized />
            <span className='font-baby-doll absolute inset-0 flex items-center justify-center text-base sm:text-xl text-black'>+52 56 1191 2788</span>
          </span>
        </Link>
      </div>
    </footer>
  )
}

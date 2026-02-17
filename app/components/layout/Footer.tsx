import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className='relative z-10 mt-8 px-4 py-12 md:px-8'>
      <div className='mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:gap-12'>
        {/* Left column - Info */}
        <div className='flex-1'>
          <h3 className='font-impact-label mb-3 text-sm tracking-wider text-gray-400 uppercase'>Información</h3>
          <ul className='font-baby-doll space-y-1.5 text-sm text-gray-400'>
            <li>
              <Link
                href='#'
                className='transition-colors hover:text-gray-200'
              >
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link
                href='#'
                className='transition-colors hover:text-gray-200'
              >
                Aviso Legal
              </Link>
            </li>
            <li>
              <Link
                href='#'
                className='transition-colors hover:text-gray-200'
              >
                Política de Cookies
              </Link>
            </li>
          </ul>

          <h3 className='font-impact-label mt-6 mb-3 text-sm tracking-wider text-gray-400 uppercase'>Usuario</h3>
          <ul className='font-baby-doll space-y-1.5 text-sm text-gray-400'>
            <li>
              <Link
                href='/signup'
                className='transition-colors hover:text-gray-200'
              >
                Regístrate
              </Link>
            </li>
            <li>
              <Link
                href='/login'
                className='transition-colors hover:text-gray-200'
              >
                Inicia sesión
              </Link>
            </li>
            <li>
              <Link
                href='#'
                className='transition-colors hover:text-gray-200'
              >
                ¿Olvidaste la contraseña?
              </Link>
            </li>
          </ul>
        </div>

        {/* Right column - Info */}
        <div className='flex-1'>
          <h3 className='font-impact-label mb-3 text-sm tracking-wider text-gray-400 uppercase'>Navegación</h3>
          <ul className='font-baby-doll space-y-1.5 text-sm text-gray-400'>
            <li>
              <Link
                href='#'
                className='transition-colors hover:text-gray-200'
              >
                Cassetes anteriores
              </Link>
            </li>
            <li>
              <Link
                href='#'
                className='transition-colors hover:text-gray-200'
              >
                Bandas
              </Link>
            </li>
            <li>
              <Link
                href='#'
                className='transition-colors hover:text-gray-200'
              >
                Fans
              </Link>
            </li>
            <li>
              <Link
                href='#'
                className='transition-colors hover:text-gray-200'
              >
                Managers
              </Link>
            </li>
            <li>
              <Link
                href='#'
                className='transition-colors hover:text-gray-200'
              >
                Venues
              </Link>
            </li>
            <li>
              <Link
                href='#'
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
            className='w-full max-w-[250px]'
            unoptimized
          />
        </div>
      </div>

      {/* Social media */}
      <div className='mx-auto mt-10 max-w-5xl text-center'>
        <p className='font-impact-label mb-4 text-sm tracking-wider text-gray-400 uppercase'>Síguenos en</p>
        <div className='flex items-center justify-center gap-6'>
          <Link
            href='#'
            className='transition-opacity hover:opacity-80'
          >
            <Image
              src='/assets/body3/facebook.png'
              alt='Facebook'
              width={120}
              height={219}
              className='h-10 w-auto'
              unoptimized
            />
          </Link>
          <Link
            href='#'
            className='transition-opacity hover:opacity-80'
          >
            <Image
              src='/assets/body3/instagram.png'
              alt='Instagram'
              width={210}
              height={212}
              className='h-10 w-auto'
              unoptimized
            />
          </Link>
        </div>
      </div>

      {/* Bottom strip */}
      <div className='mx-auto mt-8 flex max-w-5xl items-center justify-center gap-8'>
        <div className='flex items-center gap-2'>
          <Image
            src='/assets/body3/cuadro-datos.png'
            alt=''
            width={379}
            height={63}
            className='h-5 w-auto'
            unoptimized
          />
          <span className='font-baby-doll text-xs text-gray-500'>aún no hay</span>
        </div>
        <div className='flex items-center gap-2'>
          <Image
            src='/assets/body3/cuadro-datos.png'
            alt=''
            width={379}
            height={63}
            className='h-5 w-auto'
            unoptimized
          />
          <span className='font-baby-doll text-xs text-gray-500'>aún no hay</span>
        </div>
        <div className='flex items-center gap-2'>
          <Image
            src='/assets/body3/cuadro-datos.png'
            alt=''
            width={379}
            height={63}
            className='h-5 w-auto'
            unoptimized
          />
          <span className='font-baby-doll text-xs text-gray-500'>aún no hay</span>
        </div>
      </div>
    </footer>
  )
}

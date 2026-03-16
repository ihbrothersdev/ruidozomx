import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 text-center'>
      <div
        className='absolute inset-0 z-0 opacity-40'
        style={{
          backgroundImage: "url('/assets/textura/background-textura.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className='relative z-10 flex max-w-md flex-col items-center gap-6'>
        <Link href='/'>
          <Image
            src='/assets/header/logo.png'
            alt='Ruidozo MX'
            width={380}
            height={183}
            className='h-20 w-auto md:h-28'
            unoptimized
            priority
          />
        </Link>

        <h1 className='font-impact-label text-[120px] leading-none tracking-wider text-red-600 md:text-[180px]'>404</h1>

        <div className='space-y-2'>
          <p className='font-baby-doll text-2xl text-white md:text-3xl'>Esta página no existe</p>
          <p className='font-pt-mono text-sm text-gray-400'>
            Parece que el cassette se enredó... esta ruta no lleva a ningún lado.
          </p>
        </div>

        <Link
          href='/'
          className='font-baby-doll mt-4 inline-block border-2 border-white px-8 py-3 text-lg text-white transition-colors hover:border-red-600 hover:bg-red-600'
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

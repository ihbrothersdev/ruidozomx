import Image from 'next/image'
import Link from 'next/link'

export function ExplorarComunidad() {
  return (
    <Link href='/comunidad' className='flex flex-col items-center transition-transform hover:scale-105'>
      <div
        className='relative overflow-hidden'
        style={{ width: 340, aspectRatio: '1206 / 759' }}
      >
        <Image
          src='/assets/body2/textura-back-video.png'
          alt=''
          fill
          className='z-0 object-cover'
          style={{ width: '100%', height: '100%' }}
          unoptimized
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className='absolute inset-[8%] -top-3 z-[1] object-cover'
          style={{ width: '110%', height: '110%' }}
          aria-label='Video de la comunidad Ruidozo'
        >
          <source
            src='/assets/body2/binoculares.webm'
            type='video/mp4'
          />
          Tu navegador no soporta el elemento de video.
        </video>
      </div>

      {/* Label */}
      <p className='font-impact-label mt-2 text-2xl tracking-wider text-green-300 uppercase'>Explorar Comunidad</p>
    </Link>
  )
}

'use client'

import Image from 'next/image'

export function ExplorarComunidad() {
  return (
    <div className='flex flex-col items-center'>
      {/* Torn paper frame with video */}
      <div
        className='relative overflow-hidden'
        style={{ width: 280, aspectRatio: '1206 / 759' }}
      >
        <Image
          src='/assets/body2/textura-back-video.png'
          alt=''
          fill
          className='z-0 object-cover'
          unoptimized
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className='absolute inset-[8%] z-[1] object-cover'
          aria-label='Video mostrando la exploración de la comunidad'
        >
          <source
            src='/assets/body2/vinoculares.mp4'
            type='video/mp4'
          />
          Tu navegador no soporta la reproducción de video. Aquí se muestra un video que ilustra la exploración de la comunidad.
        </video>
      </div>

      {/* Label */}
      <p className='font-impact-label mt-2 text-xl tracking-wider text-green-500 uppercase'>Explorar Comunidad</p>
    </div>
  )
}

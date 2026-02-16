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
          className='z-[1] object-cover'
          unoptimized
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className='absolute inset-[8%] z-0 h-[84%] w-[84%] object-cover'
        >
          <source
            src='/assets/body2/vinoculares.mp4'
            type='video/mp4'
          />
        </video>
      </div>

      {/* Label */}
      <p className='font-impact-label mt-2 text-sm tracking-wider text-gray-300 uppercase'>Explorar Comunidad</p>
    </div>
  )
}

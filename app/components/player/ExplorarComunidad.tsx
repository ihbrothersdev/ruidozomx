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
          className='absolute inset-[8%] z-[1] h-[84%] w-[84%] object-cover'
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
      <p className='font-impact-label mt-2 text-xl tracking-wider text-green-300 uppercase'>Explorar Comunidad</p>
    </div>
  )
}

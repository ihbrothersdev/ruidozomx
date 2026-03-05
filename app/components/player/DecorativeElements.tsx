import Image from 'next/image'

export function DecorativeElements() {
  return (
    <>
      {/* Virgin Mary collage - left side */}
      <div className='absolute top-0 left-2 z-0 hidden lg:block'>
        <Image
          src='/assets/decorativos/pedazo-de-papel.png'
          alt=''
          width={521}
          height={1179}
          className='w-full'
          unoptimized
        />
      </div>

      {/* Rocket man - right side */}
      <div className='absolute top-0 right-2 z-0 hidden w-36 lg:block'>
        <Image
          src='/assets/decorativos/cohete.png'
          alt=''
          width={384}
          height={839}
          className='w-full'
          unoptimized
        />
      </div>
    </>
  )
}

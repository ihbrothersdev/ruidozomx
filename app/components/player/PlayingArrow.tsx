import Image from 'next/image'

export function PlayingArrow() {
  return (
    <div
      className='absolute top-5 -right-3 z-10 w-[100px] md:top-15 md:-right-25 md:w-[200px]'
    >
      <Image
        src='/assets/decorativos/senal.png'
        alt='Playing'
        width={191}
        height={79}
        className='w-full'
        unoptimized
      />
    </div>
  )
}

import Image from 'next/image'

export function PlayingArrow() {
  return (
    <div
      className='absolute top-15 -right-25 z-10 hidden md:block'
      style={{ width: 200 }}
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

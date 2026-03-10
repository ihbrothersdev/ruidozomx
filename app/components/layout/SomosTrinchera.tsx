import Image from 'next/image'

export function SomosTrinchera() {
  return (
    <div className='mx-auto w-full max-w-7xl py-5'>
      <Image
        src='/assets/body2/somos-trinchera.png'
        alt='Esto es Ruidozo y somos trinchera'
        width={1978}
        height={323}
        className='w-full'
        unoptimized
      />
    </div>
  )
}

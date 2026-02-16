import Image from 'next/image'

export function SomosTrinchera() {
  return (
    <div className='mx-auto w-full max-w-9xl px-4 py-8'>
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

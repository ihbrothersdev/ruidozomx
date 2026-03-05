import Image from 'next/image'

interface MientrasSuenaProps {
  listenerCount: number
}

export function MientrasSuena({ listenerCount }: MientrasSuenaProps) {
  return (
    <div className='mx-auto mt-3 flex max-w-[793px] items-center gap-3'>
      {/* Mientras Suena tape label */}
      <Image
        src='/assets/body1/mientras-suena.png'
        alt='Mientras suena'
        width={477}
        height={159}
        className='h-8 w-auto md:h-10'
        unoptimized
      />
    </div>
  )
}

import Image from 'next/image'
import Link from 'next/link'

interface DialogBubbleProps {
  isAuthenticated?: boolean
}

export function DialogBubble({ isAuthenticated }: DialogBubbleProps) {
  if (isAuthenticated) return null

  return (
    <Link
      href='/registro/elige-rol'
      className='absolute -top-5 left-0 z-10 w-[88px] transition-transform hover:scale-105 sm:top-2 sm:left-1 sm:w-[150px] md:w-[175px] lg:top-[20%] lg:-left-24 lg:w-[210px] lg:-translate-y-1/2 xl:-left-44 xl:w-[240px]'
    >
      <Image
        src='/assets/body1/register.png'
        alt='Este cassete no va a sonar solo, regístrate y hazlo sonar'
        width={253}
        height={119}
        className='w-full'
      />
    </Link>
  )
}

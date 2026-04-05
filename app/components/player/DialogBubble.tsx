import Image from 'next/image'
import Link from 'next/link'

interface DialogBubbleProps {
  isAuthenticated?: boolean
}

export function DialogBubble({ isAuthenticated }: DialogBubbleProps) {
  // Don't show "register" bubble if user is already logged in
  if (isAuthenticated) return null

  return (
    <Link
      href='/registro/elige-rol'
      className='absolute top-44 -right-3 z-10 w-[120px] transition-transform hover:scale-105 md:top-60 md:-right-50 md:w-[240px]'
    >
      <Image
        src='/assets/body1/no-va-a-sonar.png'
        alt='Este cassete no va a sonar solo, regístrate y hazlo sonar'
        width={253}
        height={120}
        className='w-full'
        unoptimized
      />
    </Link>
  )
}
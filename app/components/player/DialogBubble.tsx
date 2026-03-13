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
      className='absolute top-87 -right-50 z-10 hidden transition-transform hover:scale-105 md:block'
      style={{ width: 240 }}
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
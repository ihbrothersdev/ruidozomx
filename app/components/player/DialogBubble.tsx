import Image from 'next/image'
import Link from 'next/link'

export function DialogBubble() {
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

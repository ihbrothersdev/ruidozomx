import Image from 'next/image'
import Link from 'next/link'

export function DonationCluster() {
  return (
    <Link
      href='/donar'
      className={`group flex flex-col items-center transition-transform hover:scale-105`}
    >
      <Image
        src='/assets/donations/helpus.png'
        alt='Ayuda a mantener vivo este espacio'
        width={276}
        height={166}
        className='w-full rotate-2'
      />
      <Image
        src='/assets/donations/arrow.png'
        alt=''
        width={58}
        height={61}
        className='-mt-1 w-[28%]'
      />
      <Image
        src='/assets/donations/jar.png'
        alt=''
        width={135}
        height={164}
        className='-mt-1 w-[55%]'
      />
    </Link>
  )
}

import Image from 'next/image'
import { Skeleton } from '@/app/components/ui/skeleton'

export function ProfileCardSkeleton() {
  return (
    <div
      className='relative w-full'
      style={{ aspectRatio: '3 / 4' }}
    >
      {/* Fondo */}
      <Image
        src='/assets/comunidad/cards/fondo.png'
        alt=''
        fill
        className='object-cover opacity-50'
        unoptimized
      />

      {/* Marco de foto skeleton */}
      <div
        className='absolute'
        style={{ left: '25%', top: '6.25%', width: '49.67%', height: '46.5%' }}
      >
        <Skeleton className='h-full w-full bg-black/10' />
      </div>

      {/* Pinza */}
      <Image
        src='/assets/comunidad/cards/pinza.png'
        alt=''
        fill
        className='object-cover opacity-50'
        unoptimized
      />

      {/* Text skeletons */}
      <div
        className='absolute inset-x-0 flex flex-col items-center gap-[2%] px-[10%]'
        style={{ top: '56%' }}
      >
        <Skeleton className='h-[3%] w-3/4 bg-black/15' style={{ minHeight: 10 }} />
        <Skeleton className='h-[2.5%] w-1/2 bg-black/10' style={{ minHeight: 8 }} />
        <Skeleton className='h-[2.5%] w-2/3 bg-black/10' style={{ minHeight: 8 }} />
      </div>

      {/* Button skeleton */}
      <div
        className='absolute inset-x-0 flex justify-center'
        style={{ bottom: '5%' }}
      >
        <Skeleton className='w-[37.3%] bg-red-600/30' style={{ height: 14 }} />
      </div>
    </div>
  )
}

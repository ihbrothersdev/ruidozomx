import { Skeleton } from '@/app/components/ui/skeleton'

export function ProfileCardSkeleton() {
  return (
    <div className='flex flex-col items-center'>
      <div className='relative w-full border-2 border-black/10 bg-[#e8e2d6] shadow-md'>
        <div className='mx-auto mt-3 aspect-[4/5] w-[85%]'>
          <Skeleton className='h-full w-full bg-[#d4b4a8]/60' />
        </div>

        <div className='flex flex-col items-center gap-2 px-3 pt-3 pb-3'>
          <Skeleton className='h-4 w-3/4 bg-black/10' />
          <Skeleton className='h-3 w-1/2 bg-black/10' />
          <Skeleton className='h-3 w-2/3 bg-black/10' />
          <Skeleton className='mt-1 h-3 w-1/2 bg-black/10' />
          <Skeleton className='h-3 w-3/4 bg-red-600/20' />
          <Skeleton className='mt-2 h-6 w-full bg-red-600/30' />
        </div>
      </div>
    </div>
  )
}

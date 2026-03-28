import type { Role } from '@/lib/types'

interface ReviewSectionProps {
  bio?: string
  role?: Role | null
}

export default function ReviewSection({ bio, role }: ReviewSectionProps) {
  const title = role === 'banda' ? 'Reseña del proyecto' : 'Descripción'

  return (
    <div>
      <h2 className='font-pt-mono text-lg tracking-wider text-black uppercase'>{title}</h2>
      <div className='mt-2 min-h-60 border border-red-500 p-4'>
        {bio ? (
          <p className='font-pt-mono text-sm text-black uppercase'>
            {bio.length > 600 ? bio.slice(0, 600) + '…' : bio}
          </p>
        ) : (
          <p className='mt-2 text-sm tracking-wider text-black uppercase'>No agregaste descripción :(</p>
        )}
      </div>
    </div>
  )
}

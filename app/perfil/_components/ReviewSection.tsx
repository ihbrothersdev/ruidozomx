'use client'

import { Textarea } from '@/app/components/ui/textarea'
import type { Role } from '@/lib/types'

interface ReviewSectionProps {
  bio?: string
  role?: Role | null
  editing?: boolean
  onBioChange?: (next: string) => void
}

export default function ReviewSection({ bio, role, editing = false, onBioChange }: ReviewSectionProps) {
  const title = role === 'banda' ? 'Reseña del proyecto' : 'Descripción'

  return (
    <div className='flex flex-1 flex-col'>
      <h2 className='font-pt-mono text-lg tracking-wider text-black uppercase'>{title}</h2>
      <div className='mt-2 flex-1 min-h-62 border border-red-500 p-4'>
        {editing ? (
          <Textarea
            value={bio ?? ''}
            onChange={e => onBioChange?.(e.target.value)}
            maxLength={600}
            rows={8}
            placeholder='600 caractéres máximo'
            className='font-pt-mono w-full resize-none border-0 bg-transparent p-0 text-sm text-black uppercase shadow-none placeholder:text-black/30 focus-visible:ring-0'
          />
        ) : bio ? (
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

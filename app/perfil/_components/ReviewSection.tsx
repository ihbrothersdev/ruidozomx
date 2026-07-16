'use client'

import { Paper } from '@/app/admin/_components/kit'
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
      <h2 className='font-pt-mono text-admin-ink text-lg tracking-wider uppercase'>{title}</h2>
      <Paper
        tone='red'
        className='mt-2 min-h-62 flex-1 p-4'
      >
        {editing ? (
          <Textarea
            value={bio ?? ''}
            onChange={e => onBioChange?.(e.target.value)}
            maxLength={600}
            rows={8}
            placeholder='600 caractéres máximo'
            className='font-pt-mono text-admin-ink placeholder:text-admin-ink-faint w-full resize-none border-0 bg-transparent p-0 text-sm uppercase shadow-none focus-visible:ring-0'
          />
        ) : bio ? (
          <p className='font-pt-mono text-admin-ink text-sm uppercase'>
            {bio.length > 600 ? bio.slice(0, 600) + '…' : bio}
          </p>
        ) : (
          <p className='text-admin-ink mt-2 text-sm tracking-wider uppercase'>No agregaste descripción :(</p>
        )}
      </Paper>
    </div>
  )
}

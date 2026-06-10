'use client'

import { ROLE_LABELS } from '@/lib/types'
import { useState } from 'react'
import ConnectionActions from '../ConnectionActions'
import type { InterestSummary } from '../DynamicModules'
import { InboxDetailModal } from './InboxDetailModal'
import { PersonAvatar } from './PersonAvatar'
import { formatInboxDate } from './shared'

interface ConnectionRowProps {
  connection: InterestSummary
  direction: 'received' | 'sent'
  isMutual: boolean
}

const MUTUAL_BADGE = (
  <span className='font-pt-mono rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase'>
    Mutua ✓
  </span>
)

/** A single connection summary; clicking it opens the detail modal. */
export function ConnectionRow({ connection, direction, isMutual }: ConnectionRowProps) {
  const [open, setOpen] = useState(false)
  const other = connection.otherProfile
  const name = other.display_name || 'Perfil'
  const date = formatInboxDate(connection.created_at)

  return (
    <li>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='flex w-full items-start gap-3 text-left transition-opacity hover:opacity-75'
      >
        <PersonAvatar
          photoUrl={other.photo_url}
          name={name}
        />
        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
            <span className='font-pt-mono font-bold text-black uppercase'>{name}</span>
            {other.role && (
              <span className='font-pt-mono rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-black/70 uppercase'>
                {ROLE_LABELS[other.role]}
              </span>
            )}
            {isMutual && MUTUAL_BADGE}
          </div>
          {connection.message && (
            <span className='font-pt-mono line-clamp-1 text-xs text-black/70'>{connection.message}</span>
          )}
          <span className='font-pt-mono text-[11px] text-black/50'>{date}</span>
        </div>
      </button>

      <InboxDetailModal
        open={open}
        onOpenChange={setOpen}
        other={other}
        message={connection.message}
        date={date}
        badge={isMutual ? MUTUAL_BADGE : undefined}
      >
        <ConnectionActions
          profileId={other.id}
          displayName={name}
          direction={direction}
          isMutual={isMutual}
        />
      </InboxDetailModal>
    </li>
  )
}

'use client'

import { LabelTag, Stamp } from '@/app/admin/_components/kit'
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

const MUTUAL_BADGE = <Stamp tone='olive'>Mutua ✓</Stamp>

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
            <span className='font-pt-mono font-bold text-admin-ink uppercase'>{name}</span>
            {other.role && <LabelTag>{ROLE_LABELS[other.role]}</LabelTag>}
            {isMutual && MUTUAL_BADGE}
          </div>
          {connection.message && (
            <span className='font-pt-mono line-clamp-1 text-xs text-admin-ink-soft'>{connection.message}</span>
          )}
          <span className='font-pt-mono text-[11px] text-admin-ink-faint'>{date}</span>
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

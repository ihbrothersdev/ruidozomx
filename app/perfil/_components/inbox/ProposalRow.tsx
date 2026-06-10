'use client'

import { ROLE_LABELS } from '@/lib/types'
import { useState } from 'react'
import type { UserProposalSummary } from '../DynamicModules'
import ProposalActions from '../ProposalActions'
import { InboxDetailModal } from './InboxDetailModal'
import { PersonAvatar } from './PersonAvatar'
import { PROPOSAL_STATUS_LABEL, formatInboxDate } from './shared'

interface ProposalRowProps {
  proposal: UserProposalSummary
  direction: 'received' | 'sent'
}

/** A single proposal summary; clicking it opens the detail modal. */
export function ProposalRow({ proposal, direction }: ProposalRowProps) {
  const [open, setOpen] = useState(false)
  const other = proposal.otherProfile
  const name = other.display_name || 'Perfil'
  const date = formatInboxDate(proposal.created_at)
  const status = PROPOSAL_STATUS_LABEL[proposal.status]
  const badge = (
    <span
      className={`font-pt-mono rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${status.cls}`}
    >
      {status.label}
    </span>
  )

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
            {badge}
          </div>
          <span className='font-pt-mono line-clamp-1 text-xs text-black/70'>{proposal.message}</span>
          <span className='font-pt-mono text-[11px] text-black/50'>{date}</span>
        </div>
      </button>

      <InboxDetailModal
        open={open}
        onOpenChange={setOpen}
        other={other}
        message={proposal.message}
        date={date}
        badge={badge}
      >
        <ProposalActions
          proposalId={proposal.id}
          displayName={name}
          direction={direction}
          status={proposal.status}
        />
      </InboxDetailModal>
    </li>
  )
}

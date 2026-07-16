'use client'

import { LabelTag, Stamp, type Tone } from '@/app/admin/_components/kit'
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

const STATUS_TONE: Record<UserProposalSummary['status'], Tone> = {
  pending: 'gold',
  accepted: 'olive',
  rejected: 'red',
  withdrawn: 'ink'
}

/** A single proposal summary; clicking it opens the detail modal. */
export function ProposalRow({ proposal, direction }: ProposalRowProps) {
  const [open, setOpen] = useState(false)
  const other = proposal.otherProfile
  const name = other.display_name || 'Perfil'
  const date = formatInboxDate(proposal.created_at)
  const status = PROPOSAL_STATUS_LABEL[proposal.status]
  const badge = <Stamp tone={STATUS_TONE[proposal.status]}>{status.label}</Stamp>

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
            {badge}
          </div>
          <span className='font-pt-mono line-clamp-1 text-xs text-admin-ink-soft'>{proposal.message}</span>
          <span className='font-pt-mono text-[11px] text-admin-ink-faint'>{date}</span>
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

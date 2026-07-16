'use client'

import { useEffect, useState } from 'react'
import { AdminButton } from '@/app/admin/_components/kit'
import type { InterestSummary, UserProposalSummary } from '../DynamicModules'
import { ConnectionsSection } from './ConnectionsSection'
import { ProposalsSection } from './ProposalsSection'

export interface ProfileInboxProps {
  receivedConnections: InterestSummary[]
  sentConnections: InterestSummary[]
  receivedProposals: UserProposalSummary[]
  sentProposals: UserProposalSummary[]
  receivedConnectionsCount: number
  sentConnectionsCount: number
  receivedProposalsCount: number
  sentProposalsCount: number
  /** Profile ids the owner has a mutual interest with (both directions exist). */
  mutualIds: string[]
}

type Tab = 'conexiones' | 'propuestas'

/**
 * The owner's inbox, split into two tabs (Conexiones / Propuestas) so only one
 * category shows at a time instead of four stacked lists. Each tab has its own
 * Recibidas / Enviadas groups. Renders nothing when both categories are empty.
 *
 * The ActivityInbox quick-links (`#conexiones`, `#propuestas`) land on the tab
 * triggers and, via the hash, switch to that tab.
 */
export function ProfileInbox({
  receivedConnections,
  sentConnections,
  receivedProposals,
  sentProposals,
  receivedConnectionsCount,
  sentConnectionsCount,
  receivedProposalsCount,
  sentProposalsCount,
  mutualIds
}: ProfileInboxProps) {
  const connTotal = receivedConnectionsCount + sentConnectionsCount
  const propTotal = receivedProposalsCount + sentProposalsCount
  const hasConn = connTotal > 0
  const hasProp = propTotal > 0

  const [tab, setTab] = useState<Tab>(hasConn ? 'conexiones' : 'propuestas')

  // Let the ActivityInbox anchor links (#conexiones / #propuestas) drive the
  // active tab, on first load and on subsequent clicks.
  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash
      if (hash === '#propuestas' && hasProp) setTab('propuestas')
      else if (hash === '#conexiones' && hasConn) setTab('conexiones')
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [hasConn, hasProp])

  if (!hasConn && !hasProp) return null

  const mutualSet = new Set(mutualIds)

  return (
    <div className='border-admin-ink/25 mt-8 border-t-2 border-dashed pt-8'>
      <div className='flex flex-wrap gap-2'>
        {hasConn && (
          <TabButton
            id='conexiones'
            label='Conexiones'
            count={connTotal}
            active={tab === 'conexiones'}
            onClick={() => setTab('conexiones')}
          />
        )}
        {hasProp && (
          <TabButton
            id='propuestas'
            label='Propuestas'
            count={propTotal}
            active={tab === 'propuestas'}
            onClick={() => setTab('propuestas')}
          />
        )}
      </div>

      <div className='mt-5 space-y-6'>
        {tab === 'conexiones' && hasConn && (
          <>
            <ConnectionsSection
              title='Quieren conectar contigo'
              count={receivedConnectionsCount}
              connections={receivedConnections}
              direction='received'
              mutualSet={mutualSet}
            />
            <ConnectionsSection
              title='Conexiones que enviaste'
              count={sentConnectionsCount}
              connections={sentConnections}
              direction='sent'
              mutualSet={mutualSet}
            />
          </>
        )}

        {tab === 'propuestas' && hasProp && (
          <>
            <ProposalsSection
              title='Propuestas recibidas'
              count={receivedProposalsCount}
              proposals={receivedProposals}
              direction='received'
            />
            <ProposalsSection
              title='Propuestas que enviaste'
              count={sentProposalsCount}
              proposals={sentProposals}
              direction='sent'
            />
          </>
        )}
      </div>
    </div>
  )
}

function TabButton({
  id,
  label,
  count,
  active,
  onClick
}: {
  id: string
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <AdminButton
      id={id}
      type='button'
      onClick={onClick}
      aria-pressed={active}
      variant={active ? 'primary' : 'outline'}
      className='scroll-mt-24'
    >
      {label}
      <span
        className={`font-pt-mono rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? 'bg-admin-surface text-admin-red' : 'bg-admin-ink/12 text-admin-ink-soft'}`}
      >
        {count}
      </span>
    </AdminButton>
  )
}

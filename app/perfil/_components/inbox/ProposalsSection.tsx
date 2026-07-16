import { Paper } from '@/app/admin/_components/kit'
import type { UserProposalSummary } from '../DynamicModules'
import { ProposalRow } from './ProposalRow'

interface ProposalsSectionProps {
  title: string
  /** Total count (may exceed the rendered rows, which are capped). */
  count: number
  proposals: UserProposalSummary[]
  direction: 'received' | 'sent'
}

/** A direction group (Recibidas / Enviadas) inside the Propuestas tab. */
export function ProposalsSection({ title, count, proposals, direction }: ProposalsSectionProps) {
  return (
    <div className='space-y-2'>
      <p className='font-pt-mono text-admin-ink text-sm font-bold tracking-wider uppercase'>
        {title} <span className='text-admin-ink-soft'>· {count}</span>
      </p>
      {proposals.length === 0 ? (
        <p className='font-pt-mono text-admin-ink-faint text-sm italic'>Nada por ahora</p>
      ) : (
        <Paper className='p-3'>
          <ul className='space-y-3'>
            {proposals.map(p => (
              <ProposalRow
                key={p.id}
                proposal={p}
                direction={direction}
              />
            ))}
          </ul>
        </Paper>
      )}
    </div>
  )
}

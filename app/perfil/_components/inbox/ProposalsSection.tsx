import type { UserProposalSummary } from '../DynamicModules'
import { ProposalRow } from './ProposalRow'
import { SECTION_LABEL, SECTION_LIST } from './shared'

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
      <p className={SECTION_LABEL}>
        {title} · {count}
      </p>
      {proposals.length === 0 ? (
        <p className='font-pt-mono text-sm text-black/45 italic'>Nada por ahora</p>
      ) : (
        <ul className={SECTION_LIST}>
          {proposals.map(p => (
            <ProposalRow
              key={p.id}
              proposal={p}
              direction={direction}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

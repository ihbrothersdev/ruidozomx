import type { InterestSummary } from '../DynamicModules'
import { ConnectionRow } from './ConnectionRow'
import { SECTION_LABEL, SECTION_LIST } from './shared'

interface ConnectionsSectionProps {
  title: string
  /** Total count (may exceed the rendered rows, which are capped). */
  count: number
  connections: InterestSummary[]
  direction: 'received' | 'sent'
  /** Profile ids the owner has a mutual interest with (both directions exist). */
  mutualSet: Set<string>
}

/** A direction group (Recibidas / Enviadas) inside the Conexiones tab. */
export function ConnectionsSection({ title, count, connections, direction, mutualSet }: ConnectionsSectionProps) {
  return (
    <div className='space-y-2'>
      <p className={SECTION_LABEL}>
        {title} · {count}
      </p>
      {connections.length === 0 ? (
        <p className='font-pt-mono text-sm text-black/45 italic'>Nada por ahora</p>
      ) : (
        <ul className={SECTION_LIST}>
          {connections.map(c => (
            <ConnectionRow
              key={c.id}
              connection={c}
              direction={direction}
              isMutual={mutualSet.has(c.otherProfile.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

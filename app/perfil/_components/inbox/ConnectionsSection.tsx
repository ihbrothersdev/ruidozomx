import { Paper } from '@/app/admin/_components/kit'
import type { InterestSummary } from '../DynamicModules'
import { ConnectionRow } from './ConnectionRow'

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
      <p className='font-pt-mono text-admin-ink text-sm font-bold tracking-wider uppercase'>
        {title} <span className='text-admin-ink-soft'>· {count}</span>
      </p>
      {connections.length === 0 ? (
        <p className='font-pt-mono text-admin-ink-faint text-sm italic'>Nada por ahora</p>
      ) : (
        <Paper className='p-3'>
          <ul className='space-y-3'>
            {connections.map(c => (
              <ConnectionRow
                key={c.id}
                connection={c}
                direction={direction}
                isMutual={mutualSet.has(c.otherProfile.id)}
              />
            ))}
          </ul>
        </Paper>
      )}
    </div>
  )
}

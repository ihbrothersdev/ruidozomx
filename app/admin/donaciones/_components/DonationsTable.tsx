import Link from 'next/link'
import { EmptyState, Stamp } from '../../_components/kit'
import type { DonationEvent } from '../_lib/aggregations'

const fmtDate = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Mexico_City'
})

export type DonorInfo = { display_name: string | null; slug: string | null }

function amountLabel(e: DonationEvent): string {
  if (e.type === 'donation_start') return '—'
  if (e.amount_mxn == null) return 'Otro'
  return `$${e.amount_mxn}`
}

function freqLabel(e: DonationEvent): string {
  if (e.type === 'donation_start') return 'Abrió flujo'
  return e.frequency === 'monthly' ? 'Mensual' : 'Única'
}

export function DonationsTable({ events, donors }: { events: DonationEvent[]; donors: Record<string, DonorInfo> }) {
  if (events.length === 0) {
    return <EmptyState>Sin intentos en este rango.</EmptyState>
  }

  return (
    <div className='admin-card overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[560px] border-collapse'>
          <thead>
            <tr className='border-b-2 border-admin-ink bg-admin-paper-deep'>
              <Th>Cuándo</Th>
              <Th>Evento</Th>
              <Th>Frecuencia</Th>
              <Th className='text-right'>Monto</Th>
              <Th>Quién</Th>
            </tr>
          </thead>
          <tbody className='font-pt-mono text-admin-ink'>
            {events.map(e => {
              const donor = e.user_id ? donors[e.user_id] : null
              const isStart = e.type === 'donation_start'
              return (
                <tr
                  key={e.id}
                  className='border-b border-admin-ink/15 last:border-0 hover:bg-admin-surface-2/60'
                >
                  <Td className='text-admin-ink-soft whitespace-nowrap'>{fmtDate.format(new Date(e.created_at))}</Td>
                  <Td>
                    <Stamp tone={isStart ? 'blue' : 'olive'}>{isStart ? 'Cooperar' : 'Monto'}</Stamp>
                  </Td>
                  <Td className='text-admin-ink-soft'>{freqLabel(e)}</Td>
                  <Td className='text-admin-ink text-right font-bold tabular-nums'>{amountLabel(e)}</Td>
                  <Td>
                    {donor ? (
                      donor.slug ? (
                        <Link
                          href={`/perfil/${donor.slug}`}
                          className='text-admin-red hover:underline'
                        >
                          {donor.display_name ?? 'Usuario'}
                        </Link>
                      ) : (
                        <span className='text-admin-ink'>{donor.display_name ?? 'Usuario'}</span>
                      )
                    ) : (
                      <span className='text-admin-ink-faint'>Anónimo</span>
                    )}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`font-pt-mono text-admin-ink px-4 py-2 text-left text-[10px] font-bold tracking-[0.18em] uppercase ${className}`}
    >
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`font-pt-mono px-4 py-2.5 text-xs ${className}`}>{children}</td>
}

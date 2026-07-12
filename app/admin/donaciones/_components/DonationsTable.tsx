import Link from 'next/link'
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
    return (
      <div className='rounded-lg border border-dashed border-white/10 py-10 text-center'>
        <p className='font-pt-mono text-xs text-white/30'>Sin intentos en este rango.</p>
      </div>
    )
  }

  return (
    <div className='overflow-x-auto rounded-lg border border-white/10'>
      <table className='w-full min-w-[560px] border-collapse'>
        <thead>
          <tr className='border-b border-white/10 bg-white/[0.03]'>
            <Th>Cuándo</Th>
            <Th>Evento</Th>
            <Th>Frecuencia</Th>
            <Th className='text-right'>Monto</Th>
            <Th>Quién</Th>
          </tr>
        </thead>
        <tbody>
          {events.map(e => {
            const donor = e.user_id ? donors[e.user_id] : null
            const isStart = e.type === 'donation_start'
            return (
              <tr
                key={e.id}
                className='border-b border-white/5 last:border-0 hover:bg-white/[0.02]'
              >
                <Td className='whitespace-nowrap text-white/50'>{fmtDate.format(new Date(e.created_at))}</Td>
                <Td>
                  <span
                    className={`font-pt-mono rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                      isStart ? 'bg-blue-500/15 text-blue-300' : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {isStart ? 'Cooperar' : 'Monto'}
                  </span>
                </Td>
                <Td className='text-white/60'>{freqLabel(e)}</Td>
                <Td className='text-right font-bold text-white'>{amountLabel(e)}</Td>
                <Td>
                  {donor ? (
                    donor.slug ? (
                      <Link
                        href={`/perfil/${donor.slug}`}
                        className='text-red-300 hover:text-red-200'
                      >
                        {donor.display_name ?? 'Usuario'}
                      </Link>
                    ) : (
                      <span className='text-white/70'>{donor.display_name ?? 'Usuario'}</span>
                    )
                  ) : (
                    <span className='text-white/30'>Anónimo</span>
                  )}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`font-pt-mono px-3 py-2.5 text-left text-[10px] font-bold tracking-widest text-white/40 uppercase ${className}`}
    >
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`font-pt-mono px-3 py-2.5 text-xs ${className}`}>{children}</td>
}

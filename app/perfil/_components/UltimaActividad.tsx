interface UltimaActividadProps {
  lastActivityAt: string | null
}

const RTF = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })

const RELATIVE_BUCKETS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 }
]

function formatRelative(date: Date): string {
  const diffMs = date.getTime() - Date.now()
  const absMs = Math.abs(diffMs)
  for (const { unit, ms } of RELATIVE_BUCKETS) {
    if (absMs >= ms) return RTF.format(Math.round(diffMs / ms), unit)
  }
  return 'hace unos segundos'
}

export default function UltimaActividad({ lastActivityAt }: UltimaActividadProps) {
  if (!lastActivityAt) {
    return (
      <div className='border-t border-black/10 pt-6'>
        <h2 className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
          Última actividad: <span className='font-normal text-black/60'>Sin actividad reciente</span>
        </h2>
      </div>
    )
  }

  const date = new Date(lastActivityAt)
  const relative = formatRelative(date)
  const absolute = date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Mexico_City'
  })

  return (
    <div className='pt-2'>
      <h2 className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
        Última actividad:{' '}
        <span
          className='font-normal text-black/60'
          title={absolute}
        >
          {relative}
        </span>
      </h2>
    </div>
  )
}

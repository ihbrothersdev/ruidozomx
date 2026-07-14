import { createServiceClient } from '@/lib/supabase/service'
import { Coins, MousePointerClick, Percent, Repeat, Users, Wallet } from 'lucide-react'
import { EmptyState, PageHeader, Paper, SectionHeading, StatCard } from '../_components/kit'
import { DonationsTable, type DonorInfo } from './_components/DonationsTable'
import { TimeFilter } from './_components/TimeFilter'
import { requireDonationViewer } from './_lib/access'
import { summarizeDonations, windowToDate, type DonationEvent, type SinceWindow } from './_lib/aggregations'

export const metadata = {
  title: 'Donaciones · Admin · Ruidozo MX'
}

const WINDOW_LABEL: Record<SinceWindow, string> = {
  '24h': 'últimas 24 horas',
  '7d': 'últimos 7 días',
  '30d': 'últimos 30 días',
  all: 'historial completo'
}

const RECENT_LIMIT = 60

function parseWindow(raw: string | undefined): SinceWindow {
  if (raw === '24h' || raw === '7d' || raw === '30d') return raw
  return 'all'
}

const money = (n: number) => `$${n.toLocaleString('es-MX')}`

export default async function DonacionesPage({ searchParams }: { searchParams: Promise<{ since?: string }> }) {
  await requireDonationViewer()

  const sp = await searchParams
  const since = parseWindow(sp.since)
  const sinceDate = windowToDate(since)

  const svc = createServiceClient()

  let eventsQuery = svc
    .from('donation_events')
    .select('id, type, user_id, session_id, frequency, amount_mxn, amount_usd, metadata, created_at')
    .order('created_at', { ascending: false })
  if (sinceDate) eventsQuery = eventsQuery.gte('created_at', sinceDate.toISOString())

  const { data: eventsData } = await eventsQuery
  const events = (eventsData ?? []) as DonationEvent[]

  const donors: Record<string, DonorInfo> = {}
  const userIds = [...new Set(events.map(e => e.user_id).filter((id): id is string => !!id))]
  if (userIds.length > 0) {
    const { data: profiles } = await svc.from('profiles').select('id, display_name, slug').in('id', userIds)
    for (const p of profiles ?? []) donors[p.id] = { display_name: p.display_name, slug: p.slug }
  }

  const s = summarizeDonations(events)
  const maxAmountCount = Math.max(1, ...s.byAmount.map(a => a.count))
  const hasData = s.starts > 0 || s.attempts > 0

  return (
    <div className='mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-12'>
      <PageHeader
        eyebrow='Cooperacha'
        title='Donaciones'
        description={
          <>
            Intentos de cooperación · <strong className='text-admin-ink'>{WINDOW_LABEL[since]}</strong>. Esto es{' '}
            <strong className='text-admin-ink'>intención</strong>, no pagos confirmados — Stripe es la fuente de verdad
            de lo que realmente se cobra.
          </>
        }
        action={<TimeFilter selected={since} />}
      />

      {!hasData ? (
        <EmptyState>
          Aún no hay intentos de donación en este rango. Aparecerán aquí cuando alguien abra “Cooperar” o elija un
          monto.
        </EmptyState>
      ) : (
        <>
          <section className='space-y-4'>
            <SectionHeading
              icon={Percent}
              title='Embudo'
              description='Del click a la elección de monto.'
            />
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
              <StatCard
                label='Aperturas'
                value={s.starts.toLocaleString('es-MX')}
                sub='Clicks en “Cooperar”'
                icon={MousePointerClick}
                tone='blue'
              />
              <StatCard
                label='Eligieron monto'
                value={s.attempts.toLocaleString('es-MX')}
                sub={`${s.customAttempts} “otro monto”`}
                icon={Coins}
                tone='olive'
              />
              <StatCard
                label='Conversión'
                value={`${s.conversionRate}%`}
                sub='Apertura → monto'
                icon={Percent}
                tone='gold'
              />
              <StatCard
                label='Mensuales'
                value={s.monthlyAttempts.toLocaleString('es-MX')}
                sub={`${s.onceAttempts} únicas`}
                icon={Repeat}
                tone='magenta'
              />
              <StatCard
                label='Con sesión'
                value={s.authedAttempts.toLocaleString('es-MX')}
                sub={`${s.anonAttempts} anónimos · ${s.uniqueUsers} usuarios`}
                icon={Users}
                tone='red'
              />
            </div>
          </section>

          <section className='space-y-4'>
            <SectionHeading
              icon={Coins}
              title='Intención de cooperación'
              description='Montos de intención, no cobros. La conversión real depende de Stripe.'
            />
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <IntentCard
                label='Puntual'
                value={money(s.oneTimeIntentMxn)}
                sub='Suma de montos únicos con preset elegidos (excluye “otro monto”)'
              />
              <IntentCard
                label='Recurrente / mes'
                value={money(s.monthlyIntentMxn)}
                sub='Suma mensual si cada intento mensual se concretara'
                accent
              />
            </div>
          </section>

          <div className='admin-sprocket' />

          <section>
            <SectionHeading
              icon={Wallet}
              title='Montos elegidos'
              description='Qué opciones se tocan más al abrir Stripe Checkout.'
            />
            <div className='space-y-2'>
              {s.byAmount.map(a => (
                <div
                  key={a.key}
                  className='flex items-center gap-3'
                >
                  <span className='font-pt-mono text-admin-ink-soft w-28 shrink-0 text-xs'>{a.label}</span>
                  <div className='bg-admin-ink/12 h-5 flex-1 overflow-hidden'>
                    <div
                      className={`h-full ${a.frequency === 'monthly' ? 'bg-admin-magenta' : 'bg-admin-olive'}`}
                      style={{ width: `${Math.round((a.count / maxAmountCount) * 100)}%` }}
                    />
                  </div>
                  <span className='font-pt-mono text-admin-ink w-8 shrink-0 text-right text-xs font-bold tabular-nums'>
                    {a.count}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading
              icon={Coins}
              title='Intentos recientes'
              description={`Últimos ${Math.min(RECENT_LIMIT, events.length)} eventos del flujo, del más reciente al más antiguo.`}
            />
            <DonationsTable
              events={events.slice(0, RECENT_LIMIT)}
              donors={donors}
            />
          </section>
        </>
      )}
    </div>
  )
}

function IntentCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <Paper
      tone={accent ? 'magenta' : undefined}
      className='p-5'
    >
      <p className='font-pt-mono text-admin-ink-soft text-[10px] font-bold tracking-[0.25em] uppercase'>{label}</p>
      <p className='font-baby-doll text-admin-ink mt-2 text-4xl leading-none font-bold tracking-wider uppercase'>
        {value} <span className='text-admin-ink-faint text-lg'>MXN</span>
      </p>
      <p className='font-pt-mono text-admin-ink-faint mt-2 text-[11px]'>{sub}</p>
    </Paper>
  )
}

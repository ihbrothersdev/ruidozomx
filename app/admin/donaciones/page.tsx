import { Card, CardContent } from '@/app/components/ui/card'
import { Separator } from '@/app/components/ui/separator'
import { createServiceClient } from '@/lib/supabase/service'
import { BarChart3, Coins, MousePointerClick, Percent, Repeat, Users, Wallet } from 'lucide-react'
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
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='font-pt-mono text-xs tracking-[0.3em] text-red-400/70 uppercase'>Cooperacha</p>
          <h1 className='font-baby-doll mt-1 text-4xl font-bold tracking-wider text-white uppercase sm:text-5xl'>
            Donaciones
          </h1>
          <p className='font-pt-mono mt-2 max-w-2xl text-xs text-white/50'>
            Intentos de cooperación · <strong className='text-white'>{WINDOW_LABEL[since]}</strong>. Esto es{' '}
            <strong className='text-white'>intención</strong>, no pagos confirmados — Stripe es la fuente de verdad de
            lo que realmente se cobra.
          </p>
        </div>
        <TimeFilter selected={since} />
      </header>

      {!hasData ? (
        <Card className='border-dashed border-white/10 bg-transparent py-12'>
          <CardContent className='font-pt-mono text-center text-xs text-white/30'>
            Aún no hay intentos de donación en este rango. Aparecerán aquí cuando alguien abra “Cooperar” o elija un
            monto.
          </CardContent>
        </Card>
      ) : (
        <>
          <section className='space-y-3'>
            <h2 className='font-pt-mono text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase'>Embudo</h2>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
              <BigStat
                label='Aperturas'
                value={s.starts.toLocaleString('es-MX')}
                sub='Clicks en “Cooperar”'
                icon={MousePointerClick}
                accent='blue'
              />
              <BigStat
                label='Eligieron monto'
                value={s.attempts.toLocaleString('es-MX')}
                sub={`${s.customAttempts} “otro monto”`}
                icon={Coins}
                accent='emerald'
              />
              <BigStat
                label='Conversión'
                value={`${s.conversionRate}%`}
                sub='Apertura → monto'
                icon={Percent}
                accent='amber'
              />
              <BigStat
                label='Mensuales'
                value={s.monthlyAttempts.toLocaleString('es-MX')}
                sub={`${s.onceAttempts} únicas`}
                icon={Repeat}
                accent='pink'
              />
              <BigStat
                label='Con sesión'
                value={s.authedAttempts.toLocaleString('es-MX')}
                sub={`${s.anonAttempts} anónimos · ${s.uniqueUsers} usuarios`}
                icon={Users}
                accent='red'
              />
            </div>
          </section>

          <section className='space-y-3'>
            <h2 className='font-pt-mono text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase'>
              Intención de cooperación
            </h2>
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
            <p className='font-pt-mono text-[11px] text-white/30'>
              Montos de intención, no cobros. La conversión real depende de Stripe.
            </p>
          </section>

          <Separator className='bg-white/5' />

          <section>
            <SectionHeader
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
                  <span className='font-pt-mono w-28 shrink-0 text-xs text-white/70'>{a.label}</span>
                  <div className='h-5 flex-1 overflow-hidden rounded bg-white/5'>
                    <div
                      className={`h-full rounded ${a.frequency === 'monthly' ? 'bg-pink-500/40' : 'bg-emerald-500/40'}`}
                      style={{ width: `${Math.round((a.count / maxAmountCount) * 100)}%` }}
                    />
                  </div>
                  <span className='font-pt-mono w-8 shrink-0 text-right text-xs font-bold text-white'>{a.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
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

function BigStat({
  label,
  value,
  sub,
  icon: Icon,
  accent
}: {
  label: string
  value: string
  sub: string
  icon: typeof BarChart3
  accent: 'red' | 'blue' | 'pink' | 'emerald' | 'amber'
}) {
  const a = {
    red: { card: 'border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/10', badge: 'bg-red-500/15 text-red-300' },
    blue: { card: 'border-blue-500/20 bg-blue-500/[0.06] hover:bg-blue-500/10', badge: 'bg-blue-500/15 text-blue-300' },
    pink: { card: 'border-pink-500/20 bg-pink-500/[0.06] hover:bg-pink-500/10', badge: 'bg-pink-500/15 text-pink-300' },
    emerald: {
      card: 'border-emerald-400/20 bg-emerald-500/[0.06] hover:bg-emerald-500/10',
      badge: 'bg-emerald-500/15 text-emerald-300'
    },
    amber: {
      card: 'border-amber-400/20 bg-amber-500/[0.06] hover:bg-amber-500/10',
      badge: 'bg-amber-500/15 text-amber-300'
    }
  }[accent]
  return (
    <Card className={`h-full gap-0 border py-0 transition-colors ${a.card}`}>
      <CardContent className='flex h-full flex-col p-5'>
        <div className='flex items-start justify-between gap-2'>
          <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase'>{label}</p>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.badge}`}>
            <Icon className='h-5 w-5' />
          </div>
        </div>
        <p className='font-baby-doll mt-3 text-4xl leading-none font-bold tracking-wider text-white uppercase'>
          {value}
        </p>
        <p className='font-pt-mono mt-auto pt-2 text-[11px] text-white/40'>{sub}</p>
      </CardContent>
    </Card>
  )
}

function IntentCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <Card
      className={`gap-0 border py-0 ${accent ? 'border-pink-500/20 bg-pink-500/[0.06]' : 'border-white/10 bg-white/3'}`}
    >
      <CardContent className='p-5'>
        <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase'>{label}</p>
        <p className='font-baby-doll mt-2 text-4xl leading-none font-bold tracking-wider text-white uppercase'>
          {value} <span className='text-lg text-white/40'>MXN</span>
        </p>
        <p className='font-pt-mono mt-2 text-[11px] text-white/40'>{sub}</p>
      </CardContent>
    </Card>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  description
}: {
  icon: typeof BarChart3
  title: string
  description: string
}) {
  return (
    <div className='mb-3 flex items-start gap-3'>
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/60'>
        <Icon className='h-4 w-4' />
      </div>
      <div>
        <h2 className='font-pt-mono text-sm font-bold tracking-wider text-white uppercase'>{title}</h2>
        <p className='font-pt-mono text-[11px] text-white/40'>{description}</p>
      </div>
    </div>
  )
}

import { Card, CardContent } from '@/app/components/ui/card'
import { createServiceClient } from '@/lib/supabase/service'
import { ArrowRight, CalendarDays, Disc3, Inbox, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createServiceClient()

  const todayIso = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local

  const [
    { data: activeCassette },
    { data: nextCassette },
    { count: pendingCount },
    { count: totalProposals },
    { count: totalUsers },
    { count: totalBands },
    { count: publishedEvents },
    { count: upcomingEvents },
    { count: totalInterests },
    { count: totalMessages }
  ] = await Promise.all([
    supabase.from('cassettes').select('id, name').eq('active', true).maybeSingle(),
    supabase.from('cassettes').select('id, name').eq('is_next', true).maybeSingle(),
    supabase.from('song_proposals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('song_proposals').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'banda'),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('event_date', todayIso),
    supabase.from('interests').select('*', { count: 'exact', head: true }),
    supabase.from('user_proposals').select('*', { count: 'exact', head: true })
  ])

  const totalConnections = (totalInterests ?? 0) + (totalMessages ?? 0)

  let activeFilled = 0
  let nextFilled = 0
  if (activeCassette) {
    const { count } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
      .eq('cassette_id', activeCassette.id)
    activeFilled = count ?? 0
  }
  if (nextCassette) {
    const { count } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
      .eq('cassette_id', nextCassette.id)
    nextFilled = count ?? 0
  }

  return (
    <div className='mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-8 sm:py-12'>
      <header>
        <p className='font-pt-mono text-xs tracking-[0.3em] text-red-400/70 uppercase'>Panel</p>
        <h1 className='font-baby-doll mt-1 text-4xl font-bold tracking-wider text-white uppercase sm:text-5xl'>
          Dashboard
        </h1>
        <p className='font-pt-mono mt-2 max-w-xl text-sm text-white/40'>
          Resumen del estado de la trinchera. Cura y publica el cassette siguiente, revisa las propuestas que llegan, y
          sigue cómo se mueve la comunidad en métricas y conexiones.
        </p>
      </header>

      {/* ── Cassettes ── */}
      <section className='space-y-3'>
        <SectionLabel>Cassettes</SectionLabel>
        <div className='grid gap-4 md:grid-cols-2'>
          <CassettePanel
            tone='active'
            label='Activo'
            name={activeCassette?.name ?? '—'}
            filled={activeFilled}
            empty={!activeCassette}
          />
          <CassettePanel
            tone='next'
            label='Siguiente'
            name={nextCassette?.name ?? 'Sin definir'}
            filled={nextFilled}
            empty={!nextCassette}
          />
        </div>
      </section>

      {/* ── Operación ── */}
      <section className='space-y-3'>
        <SectionLabel>Operación</SectionLabel>
        <div className='grid gap-4 md:grid-cols-2'>
          <Link
            href='/admin/propuestas'
            className='group block'
          >
            <Card className='h-full gap-0 border-emerald-400/20 bg-emerald-500/[0.06] py-0 transition-colors hover:bg-emerald-500/10'>
              <CardContent className='flex h-full items-center gap-4 p-5'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300'>
                  <Inbox className='h-5 w-5' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase'>
                    Propuestas pendientes
                  </p>
                  <p className='font-baby-doll mt-1 text-3xl leading-none font-bold text-white'>{pendingCount ?? 0}</p>
                  <p className='font-pt-mono mt-1 text-xs text-white/40'>de {totalProposals ?? 0} totales</p>
                </div>
                <ArrowRight className='h-4 w-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-emerald-300' />
              </CardContent>
            </Card>
          </Link>

          <Link
            href='/admin/eventos'
            className='group block'
          >
            <Card className='h-full gap-0 border-white/10 bg-white/[0.03] py-0 transition-colors hover:bg-white/[0.06]'>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between'>
                  <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase'>
                    Eventos
                  </p>
                  <CalendarDays className='h-4 w-4 text-white/40' />
                </div>
                <div className='mt-3 flex items-center gap-6'>
                  <Figure
                    value={publishedEvents ?? 0}
                    label='Publicados'
                  />
                  <div className='h-8 w-px bg-white/10' />
                  <Figure
                    value={upcomingEvents ?? 0}
                    label='Próximos'
                    accent
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* ── Comunidad ── */}
      <section className='space-y-3'>
        <SectionLabel>Comunidad</SectionLabel>
        <Card className='gap-0 border-white/10 bg-white/[0.03] py-0'>
          <CardContent className='flex flex-wrap items-center gap-x-10 gap-y-5 p-5'>
            <Figure
              value={totalUsers ?? 0}
              label='Usuarios'
            />
            <div className='h-8 w-px bg-white/10' />
            <Figure
              value={totalBands ?? 0}
              label='Bandas'
            />
            <div className='h-8 w-px bg-white/10' />
            <Link
              href='/admin/conexiones'
              className='group flex items-center gap-2'
            >
              <Figure
                value={totalConnections}
                label='Conexiones'
              />
              <ArrowRight className='h-4 w-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-red-400' />
            </Link>
            <p className='font-pt-mono ml-auto text-right text-[11px] text-white/30'>
              {totalInterests ?? 0} intereses · {totalMessages ?? 0} mensajes directos
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className='font-pt-mono text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase'>{children}</h2>
}

function Figure({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={`font-baby-doll text-3xl leading-none font-bold ${accent ? 'text-emerald-300' : 'text-white'}`}>
        {value.toLocaleString('es-MX')}
      </p>
      <p className='font-pt-mono mt-1.5 text-[10px] tracking-widest text-white/40 uppercase'>{label}</p>
    </div>
  )
}

function CassettePanel({
  tone,
  label,
  name,
  filled,
  empty
}: {
  tone: 'active' | 'next'
  label: string
  name: string
  filled: number
  empty: boolean
}) {
  const cap = Math.max(26, filled)
  const pct = Math.round((filled / cap) * 100)
  const card =
    tone === 'active'
      ? 'border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/10'
      : 'border-amber-400/20 bg-amber-500/[0.06] hover:bg-amber-500/10'
  const bar = tone === 'active' ? 'bg-red-500' : 'bg-amber-400'
  const Icon = tone === 'active' ? Disc3 : Sparkles

  return (
    <Link
      href='/admin/cassettes'
      className='block'
    >
      <Card className={`h-full gap-0 border py-0 transition-colors ${card}`}>
        <CardContent className='p-5'>
          <div className='flex items-center justify-between'>
            <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase'>
              Cassette {label}
            </p>
            <Icon className='h-4 w-4 text-white/40' />
          </div>
          <p className='font-baby-doll mt-3 truncate text-3xl font-bold text-white uppercase'>{name}</p>
          {empty ? (
            <p className='font-pt-mono mt-4 text-xs text-white/40'>
              {tone === 'active' ? 'Ninguno activo' : 'Crea uno en Cassettes'}
            </p>
          ) : (
            <div className='mt-4'>
              <div className='mb-1.5 flex items-center justify-between'>
                <span className='font-pt-mono text-[10px] tracking-widest text-white/40 uppercase'>
                  {filled}/{cap} slots
                </span>
                <span className='font-pt-mono text-[10px] tracking-widest text-white/40 uppercase'>{pct}%</span>
              </div>
              <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
                <div
                  className={`h-full rounded-full ${bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

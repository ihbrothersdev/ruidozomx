import { createServiceClient } from '@/lib/supabase/service'
import { cn } from '@/lib/utils'
import { ArrowRight, CalendarDays, Disc3, Inbox, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'
import { EmptyState, LabelTag, PageHeader, Paper, SectionHeading, Stamp, StatCard } from './_components/kit'

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
      <PageHeader
        eyebrow='Trinchera · Panel'
        title='Dashboard'
        description='El estado de la trinchera de un vistazo. Cura y publica el cassette siguiente, revisa las propuestas que llegan, y sigue cómo se mueve la comunidad.'
      />

      {/* ── Cassettes ── */}
      <section className='space-y-4'>
        <SectionHeading
          icon={Disc3}
          title='Cassettes'
          description='Uno suena, uno se arma.'
        />
        <div className='grid gap-5 md:grid-cols-2'>
          <CassettePanel
            tone='active'
            label='Cassette activo'
            name={activeCassette?.name ?? '—'}
            filled={activeFilled}
            empty={!activeCassette}
          />
          <CassettePanel
            tone='next'
            label='Cassette siguiente'
            name={nextCassette?.name ?? 'Sin definir'}
            filled={nextFilled}
            empty={!nextCassette}
          />
        </div>
      </section>

      {/* ── Operación ── */}
      <section className='space-y-4'>
        <SectionHeading
          icon={Inbox}
          title='Operación'
          description='Lo que pide tu atención.'
        />
        <div className='grid gap-5 md:grid-cols-2'>
          <Link
            href='/admin/propuestas'
            className='group block h-full'
          >
            <Paper
              tone='gold'
              className='admin-press flex h-full flex-col justify-center gap-3.5 p-5'
            >
              <div className='flex items-center gap-4'>
                <span className='flex h-14 w-14 shrink-0 items-center justify-center border-2 border-admin-gold text-admin-gold'>
                  <Inbox className='h-7 w-7' />
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='font-pt-mono text-[10px] font-bold tracking-[0.2em] text-admin-ink-soft uppercase'>
                    Propuestas pendientes
                  </p>
                  <p className='font-baby-doll mt-0.5 flex items-baseline gap-2 leading-none text-admin-ink'>
                    <span className='text-5xl font-bold'>{pendingCount ?? 0}</span>
                    <span className='font-pt-mono text-sm text-admin-ink-faint'>/ {totalProposals ?? 0} totales</span>
                  </p>
                </div>
                <div className='flex shrink-0 flex-col items-end gap-2'>
                  {(pendingCount ?? 0) > 0 && <Stamp tone='gold'>Revisar</Stamp>}
                  <ArrowRight className='h-5 w-5 text-admin-ink/40 transition-transform group-hover:translate-x-1' />
                </div>
              </div>
              <div className='h-1.5 w-full overflow-hidden bg-admin-ink/12'>
                <div
                  className='h-full bg-admin-gold'
                  style={{ width: `${totalProposals ? Math.round(((pendingCount ?? 0) / totalProposals) * 100) : 0}%` }}
                />
              </div>
            </Paper>
          </Link>

          <Link
            href='/admin/eventos'
            className='group block h-full'
          >
            <Paper className='admin-press flex h-full flex-col justify-center gap-3.5 p-5'>
              <div className='flex items-center gap-4'>
                <span className='flex h-14 w-14 shrink-0 items-center justify-center border-2 border-admin-ink text-admin-ink'>
                  <CalendarDays className='h-7 w-7' />
                </span>
                <div className='flex flex-1 items-center gap-6'>
                  <Figure
                    value={publishedEvents ?? 0}
                    label='Publicados'
                  />
                  <div className='h-9 w-0.5 bg-admin-ink/15' />
                  <Figure
                    value={upcomingEvents ?? 0}
                    label='Próximos'
                    tone='red'
                  />
                </div>
                <ArrowRight className='h-5 w-5 shrink-0 text-admin-ink/40 transition-transform group-hover:translate-x-1' />
              </div>
              <p className='font-pt-mono text-[10px] tracking-[0.15em] text-admin-ink-faint uppercase'>
                Agenda de la escena · solo lectura
              </p>
            </Paper>
          </Link>
        </div>
      </section>

      {/* ── Comunidad ── */}
      <section className='space-y-4'>
        <SectionHeading
          icon={Users}
          title='Comunidad'
          description='La escena, en números.'
        />
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          <StatCard
            label='Usuarios'
            value={(totalUsers ?? 0).toLocaleString('es-MX')}
            sub='En la trinchera'
            icon={Users}
            tone='ink'
          />
          <StatCard
            label='Bandas'
            value={(totalBands ?? 0).toLocaleString('es-MX')}
            sub='Perfiles de banda'
            icon={Disc3}
            tone='ink'
          />
          <Link
            href='/admin/conexiones'
            className='group block'
          >
            <StatCardLink
              label='Conexiones'
              value={totalConnections.toLocaleString('es-MX')}
              sub={`${totalInterests ?? 0} intereses · ${totalMessages ?? 0} mensajes`}
            />
          </Link>
        </div>
      </section>
    </div>
  )
}

function Figure({ value, label, tone }: { value: number; label: string; tone?: 'red' }) {
  return (
    <div>
      <p
        className={cn(
          'font-baby-doll text-3xl leading-none font-bold',
          tone === 'red' ? 'text-admin-red' : 'text-admin-ink'
        )}
      >
        {value.toLocaleString('es-MX')}
      </p>
      <p className='font-pt-mono text-admin-ink-faint mt-1.5 text-[10px] tracking-[0.15em] uppercase'>{label}</p>
    </div>
  )
}

function StatCardLink({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Paper
      tone='red'
      className='admin-press flex h-full flex-col p-4'
    >
      <div className='flex items-start justify-between gap-2'>
        <p className='font-pt-mono text-admin-ink-soft text-[10px] font-bold tracking-[0.2em] uppercase'>{label}</p>
        <ArrowRight className='text-admin-red h-4 w-4 transition-transform group-hover:translate-x-1' />
      </div>
      <p className='font-baby-doll text-admin-ink mt-2 text-4xl leading-none font-bold'>{value}</p>
      <p className='font-pt-mono text-admin-ink-faint mt-auto pt-2 text-[11px]'>{sub}</p>
    </Paper>
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
  const segments = 26
  const lit = Math.min(segments, Math.round((filled / cap) * segments))
  const paperTone = tone === 'active' ? 'red' : 'gold'
  const meterColor = tone === 'active' ? 'bg-admin-red' : 'bg-admin-gold'
  const Icon = tone === 'active' ? Disc3 : Sparkles

  return (
    <Link
      href='/admin/cassettes'
      className='block'
    >
      <Paper
        tone={paperTone}
        className='admin-press p-5'
      >
        <div className='flex items-center justify-between'>
          <LabelTag tone={tone === 'active' ? 'red' : 'gold'}>{label}</LabelTag>
          <Icon className={cn('h-4 w-4', tone === 'active' ? 'text-admin-red' : 'text-admin-gold')} />
        </div>

        {/* Cassette body */}
        <div className='border-admin-ink bg-admin-paper mt-4 flex items-center gap-4 border-2 px-4 py-3'>
          <Reel spin={tone === 'active' && !empty} />
          <div className='min-w-0 flex-1 text-center'>
            <p className='font-baby-doll text-admin-ink truncate text-2xl leading-none font-bold uppercase'>{name}</p>
            <p className='font-pt-mono text-admin-ink-faint mt-1 text-[9px] tracking-[0.2em] uppercase'>
              {tone === 'active' ? 'Side A · suena en la home' : 'Recibe propuestas'}
            </p>
          </div>
          <Reel spin={tone === 'active' && !empty} />
        </div>

        {empty ? (
          <p className='font-pt-mono text-admin-ink-faint mt-4 text-xs'>
            {tone === 'active' ? 'Ninguno activo' : 'Crea uno en Cassettes'}
          </p>
        ) : (
          <div className='mt-4'>
            <div className='mb-1.5 flex items-center justify-between'>
              <span className='font-pt-mono text-admin-ink-soft text-[10px] tracking-[0.15em] uppercase'>
                {filled}/{cap} slots
              </span>
              <span className='font-pt-mono text-admin-ink-soft text-[10px] tracking-[0.15em] uppercase'>
                {Math.round((filled / cap) * 100)}%
              </span>
            </div>
            <div
              className='flex gap-[2px]'
              aria-hidden
            >
              {Array.from({ length: segments }).map((_, i) => (
                <span
                  key={i}
                  className={cn('h-2.5 flex-1', i < lit ? meterColor : 'bg-admin-ink/12')}
                />
              ))}
            </div>
          </div>
        )}
      </Paper>
    </Link>
  )
}

function Reel({ spin }: { spin: boolean }) {
  return (
    <span className='border-admin-ink bg-admin-surface relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2'>
      <span className={cn('border-admin-ink/40 absolute inset-1.5 rounded-full border', spin && 'admin-reel-spin')}>
        <span className='bg-admin-ink/40 absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2' />
        <span className='bg-admin-ink/40 absolute top-0 left-1/2 h-full w-[1.5px] -translate-x-1/2' />
        <span className='bg-admin-ink absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full' />
      </span>
    </span>
  )
}

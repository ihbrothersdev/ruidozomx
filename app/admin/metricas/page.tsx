import { createServiceClient } from '@/lib/supabase/service'
import { BarChart3, CalendarDays, Headphones, Heart, LineChart, Music2, Play, Send, Users } from 'lucide-react'
import Link from 'next/link'
import { EmptyState, Notice, PageHeader, Paper, SectionHeading, StatCard } from '../_components/kit'
import { CassetteFilter, type CassetteOption } from './_components/CassetteFilter'
import { CassettesTable } from './_components/CassettesTable'
import { PlaysChart } from './_components/PlaysChart'
import { SongsTable } from './_components/SongsTable'
import { TimeFilter } from './_components/TimeFilter'
import {
  windowToDate,
  type CassetteMetricRow,
  type CassetteRow,
  type DailyPoint,
  type SinceWindow,
  type SongMetricRow
} from './_lib/aggregations'

export const metadata = {
  title: 'Métricas · Admin · Ruidozo MX'
}

interface ListenerRow {
  user_id: string
  display_name: string | null
  slug: string | null
  photo_url: string | null
  total_plays: number
  unique_songs: number
  most_played_song_id: string | null
  most_played_count: number | null
}

interface ProposerRow {
  user_id: string
  display_name: string | null
  slug: string | null
  photo_url: string | null
  total_proposals: number
  accepted: number
  rejected: number
  pending: number
  acceptance_rate: number
}

interface ActiveStats {
  active_users: number
  listeners: number
  proposers: number
}

interface ConnectionMetrics {
  total_interests: number
  unique_interest_givers: number
  unique_interest_receivers: number
  total_user_proposals: number
  unique_proposers: number
  unique_proposed_to: number
}

const WINDOW_LABEL: Record<SinceWindow, string> = {
  '24h': 'últimas 24 horas',
  '7d': 'últimos 7 días',
  '30d': 'últimos 30 días',
  all: 'historial completo'
}

function parseWindow(raw: string | undefined): SinceWindow {
  if (raw === '24h' || raw === '7d' || raw === '30d') return raw
  return 'all'
}

export default async function MetricasPage({
  searchParams
}: {
  searchParams: Promise<{ cassette?: string; since?: string }>
}) {
  const sp = await searchParams
  const since = parseWindow(sp.since)
  const cassetteFilter = sp.cassette && sp.cassette !== 'all' ? sp.cassette : null
  const sinceDate = windowToDate(since)
  const sinceParam = sinceDate ? sinceDate.toISOString() : null

  const svc = createServiceClient()
  const p_cassette_id = cassetteFilter

  // ── Parallel fetches ────────────────────────────────────────────────────
  // The cassette list only drives the filter dropdown. Every metric comes from
  // an RPC that aggregates in SQL, so it isn't capped at PostgREST's 1000-row
  // limit the way pulling raw song_events into JS was (that dropped the newest
  // cassette entirely — see _lib/aggregations).
  const cassetteListPromise = svc
    .from('cassettes')
    .select('id, name, active, archived, is_next')
    .order('start_date', { ascending: false })

  const [
    cassetteListRes,
    cassetteMetricsRes,
    songMetricsRes,
    dailyRes,
    listenersRes,
    proposersRes,
    connectionsRes,
    publishedEventsRes,
    activeStatsRes
  ] = await Promise.all([
    cassetteListPromise,
    svc.rpc('cassette_metrics', { p_since: sinceParam, p_cassette_id }),
    svc.rpc('song_metrics', { p_since: sinceParam, p_cassette_id }),
    svc.rpc('event_daily_series', { p_since: sinceParam, p_cassette_id }),
    svc.rpc('top_listeners', { p_limit: 10, p_since: sinceParam }),
    svc.rpc('top_proposers', { p_limit: 10, p_since: sinceParam }),
    svc.rpc('connection_metrics', { p_since: sinceParam }),
    svc.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    svc.rpc('active_user_stats', { p_since: sinceParam })
  ])

  // ── Normalize ─────────────────────────────────────────────────────────────
  const cassetteList = (cassetteListRes.data ?? []) as CassetteRow[]
  const cassetteMetrics = (cassetteMetricsRes.data ?? []) as CassetteMetricRow[]
  const songMetrics = (songMetricsRes.data ?? []) as SongMetricRow[]
  const dailyRaw = (dailyRes.data ?? []) as {
    day: string
    plays: number
    auth_plays: number
    completes: number
    sessions: number
  }[]
  const daily: DailyPoint[] = dailyRaw.map(d => ({
    date: d.day,
    plays: d.plays,
    completes: d.completes,
    sessions: d.sessions
  }))

  // These RPCs respect the time window (p_since) but not the cassette filter.
  const topListeners = (listenersRes.data ?? []) as ListenerRow[]
  const topProposers = (proposersRes.data ?? []) as ProposerRow[]
  const connections = ((connectionsRes.data ?? [])[0] ?? {
    total_interests: 0,
    unique_interest_givers: 0,
    unique_interest_receivers: 0,
    total_user_proposals: 0,
    unique_proposers: 0,
    unique_proposed_to: 0
  }) as ConnectionMetrics

  const cassetteOptions: CassetteOption[] = cassetteList.map(c => ({
    id: c.id,
    name: c.name ?? 'Sin nombre',
    state: c.active ? 'active' : c.is_next ? 'next' : c.archived ? 'archived' : 'draft'
  }))

  const selectedCassetteName = cassetteFilter
    ? (cassetteOptions.find(c => c.id === cassetteFilter)?.name ?? 'Cassette seleccionado')
    : null

  const totalPlays = dailyRaw.reduce((sum, d) => sum + d.plays, 0)
  const totalAuthPlays = dailyRaw.reduce((sum, d) => sum + d.auth_plays, 0)
  const totalSessionsStarted = dailyRaw.reduce((sum, d) => sum + d.sessions, 0)
  const activeStats = ((activeStatsRes.data ?? [])[0] ?? {
    active_users: 0,
    listeners: 0,
    proposers: 0
  }) as ActiveStats
  const bothActive = Math.max(0, activeStats.listeners + activeStats.proposers - activeStats.active_users)
  const onlyProposers = activeStats.proposers - bothActive
  const onlyListeners = activeStats.listeners - bothActive
  const publishedEvents = publishedEventsRes.count ?? 0

  const hasAnyData =
    totalPlays > 0 ||
    totalSessionsStarted > 0 ||
    connections.total_interests > 0 ||
    connections.total_user_proposals > 0

  return (
    <div className='mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-8 sm:py-12'>
      <PageHeader
        eyebrow='Trinchera · Métricas'
        title='Métricas'
        description={
          <>
            Cómo conecta la gente con el contenido · <strong className='text-admin-ink'>{WINDOW_LABEL[since]}</strong>
            {selectedCassetteName ? (
              <>
                {' · '}
                <strong className='text-admin-ink'>{selectedCassetteName}</strong>
              </>
            ) : null}
            . Haz clic en una canción para ver el detalle de oyentes.
            <span className='text-admin-ink-faint mt-2 block text-[11px]'>
              Usuarios activos, conexiones y los tops respetan el filtro de días (no el de cassette). Eventos publicados
              es global. Las conexiones entre perfiles viven en su propia pestaña.
            </span>
          </>
        }
        action={
          <div className='flex flex-wrap items-center gap-3'>
            <TimeFilter selected={since} />
            <CassetteFilter
              options={cassetteOptions}
              selected={cassetteFilter ?? 'all'}
            />
          </div>
        }
      />

      {!hasAnyData && (
        <Notice tone='gold'>
          {cassetteFilter || since !== 'all'
            ? 'No hay eventos registrados con esos filtros. Prueba ampliando el rango o cambiando el cassette.'
            : 'Aún no hay eventos registrados. Los plays, sesiones y clicks empezarán a aparecer aquí en cuanto la gente interactúe con el cassette activo.'}
        </Notice>
      )}

      <section className='space-y-3'>
        <SectionHeading
          icon={BarChart3}
          title='Resumen del periodo'
        />
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
          <StatCard
            label='Reproducciones'
            value={totalPlays.toLocaleString('es-MX')}
            sub={`${totalAuthPlays.toLocaleString('es-MX')} con sesión`}
            icon={Play}
            tone='red'
          />
          <StatCard
            label='Sesiones cassette'
            value={totalSessionsStarted.toLocaleString('es-MX')}
            sub='Inicios de player'
            icon={Headphones}
            tone='blue'
          />
          <StatCard
            label='Conexiones'
            value={connections.total_interests.toLocaleString('es-MX')}
            sub={`+${connections.total_user_proposals} mensajes`}
            icon={Heart}
            tone='magenta'
          />
          <StatCard
            label='Usuarios activos'
            value={activeStats.active_users.toLocaleString('es-MX')}
            sub={`${onlyProposers} solo sugieren · ${bothActive} ambos · ${onlyListeners} solo oyen`}
            icon={Users}
            tone='olive'
          />
          <StatCard
            label='Eventos publicados'
            value={publishedEvents.toLocaleString('es-MX')}
            sub='Global · ignora filtros'
            icon={CalendarDays}
            tone='gold'
          />
        </div>
      </section>

      <section>
        <SectionHeading
          icon={LineChart}
          title='Evolución temporal'
          description='Plays, completes y sesiones por día. Cambia el rango arriba.'
        />
        <PlaysChart data={daily} />
      </section>

      <div className='admin-sprocket' />

      <section>
        <SectionHeading
          icon={Headphones}
          title='Sesiones por cassette'
          description='Cuánta gente arranca el player y cuántas terminan la sesión. Click en encabezado para ordenar.'
        />
        <CassettesTable rows={cassetteMetrics} />
      </section>

      <section>
        <SectionHeading
          icon={Music2}
          title='Top canciones'
          description='Click en una fila para ver oyentes y desglose de eventos. Filtra por lado o busca por banda/título.'
        />
        <SongsTable
          rows={songMetrics}
          since={since}
        />
      </section>

      <section className='grid gap-6 lg:grid-cols-2'>
        <div>
          <SectionHeading
            icon={Headphones}
            title='Top fans (oyentes con sesión)'
            description='Quién escucha más, y qué canciones repiten.'
          />
          {topListeners.length === 0 ? (
            <EmptyState icon={Headphones}>Aún no hay plays con sesión iniciada.</EmptyState>
          ) : (
            <ul className='space-y-2'>
              {topListeners.map((l, i) => (
                <li key={l.user_id}>
                  <Paper className='flex items-center gap-3 p-3'>
                    <span className='font-baby-doll text-admin-ink-faint w-6 shrink-0 text-center text-2xl'>
                      {i + 1}
                    </span>
                    <ProfileAvatar
                      photo={l.photo_url}
                      name={l.display_name ?? 'Usuario'}
                    />
                    <div className='min-w-0 flex-1'>
                      <Link
                        href={l.slug ? `/perfil/${l.slug}` : '#'}
                        className='font-pt-mono text-admin-ink hover:text-admin-red truncate text-xs font-bold'
                      >
                        {l.display_name ?? 'Usuario'}
                      </Link>
                      <p className='font-pt-mono text-admin-ink-soft text-[10px]'>
                        {l.unique_songs} {l.unique_songs === 1 ? 'rola distinta' : 'rolas distintas'}
                        {l.most_played_count && l.most_played_count > 1
                          ? ` · la más escuchada, ${l.most_played_count} veces`
                          : ''}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-baby-doll text-admin-red text-xl font-bold'>
                        {l.total_plays.toLocaleString('es-MX')}
                      </p>
                      <p className='font-pt-mono text-admin-ink-faint text-[9px] tracking-widest uppercase'>plays</p>
                    </div>
                  </Paper>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <SectionHeading
            icon={Send}
            title='Top sugerencias'
            description='Quién manda más rolas y cuántas se aceptan.'
          />
          {topProposers.length === 0 ? (
            <EmptyState icon={Send}>Aún no hay propuestas registradas.</EmptyState>
          ) : (
            <ul className='space-y-2'>
              {topProposers.map((p, i) => {
                const reviewed = Number(p.accepted) + Number(p.rejected)
                return (
                  <li key={p.user_id}>
                    <Paper className='flex items-center gap-3 p-3'>
                      <span className='font-baby-doll text-admin-ink-faint w-6 shrink-0 text-center text-2xl'>
                        {i + 1}
                      </span>
                      <ProfileAvatar
                        photo={p.photo_url}
                        name={p.display_name ?? 'Usuario'}
                      />
                      <div className='min-w-0 flex-1'>
                        <Link
                          href={p.slug ? `/perfil/${p.slug}` : '#'}
                          className='font-pt-mono text-admin-ink hover:text-admin-red truncate text-xs font-bold'
                        >
                          {p.display_name ?? 'Usuario'}
                        </Link>
                        <p className='font-pt-mono text-admin-ink-soft text-[10px]'>
                          <span className='text-admin-olive'>{p.accepted} ✓</span>
                          {' · '}
                          <span className='text-admin-ink-faint'>{p.rejected} ✗</span>
                          {' · '}
                          <span className='text-admin-gold'>{p.pending} ⏳</span>
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-baby-doll text-admin-olive text-xl font-bold'>{p.total_proposals}</p>
                        <p className='font-pt-mono text-admin-ink-faint text-[9px] tracking-widest uppercase'>
                          {reviewed > 0 ? `${Number(p.acceptance_rate)}% de ${reviewed} rev.` : 'Sin revisar'}
                        </p>
                      </div>
                    </Paper>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

function ProfileAvatar({ photo, name }: { photo: string | null; name: string }) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        className='border-admin-ink h-9 w-9 shrink-0 rounded-full border-2 object-cover'
      />
    )
  }
  return (
    <div className='border-admin-ink bg-admin-surface-2 text-admin-ink-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold'>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

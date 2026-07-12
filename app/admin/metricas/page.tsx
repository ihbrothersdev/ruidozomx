import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Card, CardContent } from '@/app/components/ui/card'
import { Separator } from '@/app/components/ui/separator'
import { createServiceClient } from '@/lib/supabase/service'
import { BarChart3, CalendarDays, Headphones, Heart, LineChart, Music2, Play, Send, Users } from 'lucide-react'
import Link from 'next/link'
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
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='font-pt-mono text-xs tracking-[0.3em] text-red-400/70 uppercase'>Métricas de comunidad</p>
          <h1 className='font-baby-doll mt-1 text-4xl font-bold tracking-wider text-white uppercase sm:text-5xl'>
            Métricas
          </h1>
          <p className='font-pt-mono mt-2 max-w-2xl text-xs text-white/50'>
            Cómo conecta la gente con el contenido · <strong className='text-white'>{WINDOW_LABEL[since]}</strong>
            {selectedCassetteName ? (
              <>
                {' · '}
                <strong className='text-white'>{selectedCassetteName}</strong>
              </>
            ) : null}
            . Haz clic en una canción para ver el detalle de oyentes.
          </p>
          <p className='font-pt-mono mt-1 text-[11px] text-white/30'>
            Usuarios activos, conexiones y los tops respetan el filtro de días (no el de cassette). Eventos publicados
            es global. Las conexiones entre perfiles viven en su propia pestaña.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <TimeFilter selected={since} />
          <CassetteFilter
            options={cassetteOptions}
            selected={cassetteFilter ?? 'all'}
          />
        </div>
      </header>

      {!hasAnyData && (
        <Alert className='border-amber-400/20 bg-amber-500/5 text-amber-200'>
          <AlertDescription className='font-pt-mono text-amber-200'>
            {cassetteFilter || since !== 'all'
              ? 'No hay eventos registrados con esos filtros. Prueba ampliando el rango o cambiando el cassette.'
              : 'Aún no hay eventos registrados. Los plays, sesiones y clicks empezarán a aparecer aquí en cuanto la gente interactúe con el cassette activo.'}
          </AlertDescription>
        </Alert>
      )}

      <section className='space-y-3'>
        <h2 className='font-pt-mono text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase'>
          Resumen del periodo
        </h2>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
          <BigStat
            label='Reproducciones'
            value={totalPlays.toLocaleString('es-MX')}
            sub={`${totalAuthPlays.toLocaleString('es-MX')} con sesión`}
            icon={Play}
            accent='red'
          />
          <BigStat
            label='Sesiones cassette'
            value={totalSessionsStarted.toLocaleString('es-MX')}
            sub='Inicios de player'
            icon={Headphones}
            accent='blue'
          />
          <BigStat
            label='Conexiones'
            value={connections.total_interests.toLocaleString('es-MX')}
            sub={`+${connections.total_user_proposals} mensajes`}
            icon={Heart}
            accent='pink'
          />
          <BigStat
            label='Usuarios activos'
            value={activeStats.active_users.toLocaleString('es-MX')}
            sub={`${onlyProposers} solo sugieren · ${bothActive} ambos · ${onlyListeners} solo oyen`}
            icon={Users}
            accent='emerald'
          />
          <BigStat
            label='Eventos publicados'
            value={publishedEvents.toLocaleString('es-MX')}
            sub='Global · ignora filtros'
            icon={CalendarDays}
            accent='amber'
          />
        </div>
      </section>

      <section>
        <SectionHeader
          icon={LineChart}
          title='Evolución temporal'
          description='Plays, completes y sesiones por día. Cambia el rango arriba.'
        />
        <PlaysChart data={daily} />
      </section>

      <Separator className='bg-white/5' />

      <section>
        <SectionHeader
          icon={Headphones}
          title='Sesiones por cassette'
          description='Cuánta gente arranca el player y cuántas terminan la sesión. Click en encabezado para ordenar.'
        />
        <CassettesTable rows={cassetteMetrics} />
      </section>

      <section>
        <SectionHeader
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
          <SectionHeader
            icon={Headphones}
            title='Top fans (oyentes con sesión)'
            description='Quién escucha más, y qué canciones repiten.'
          />
          {topListeners.length === 0 ? (
            <EmptyCard text='Aún no hay plays con sesión iniciada.' />
          ) : (
            <ul className='space-y-2'>
              {topListeners.map((l, i) => (
                <Card
                  key={l.user_id}
                  className='gap-0 border-white/10 bg-white/3 py-0'
                >
                  <CardContent className='flex items-center gap-3 p-3'>
                    <span className='font-baby-doll w-6 shrink-0 text-center text-2xl text-white/30'>{i + 1}</span>
                    <ProfileAvatar
                      photo={l.photo_url}
                      name={l.display_name ?? 'Usuario'}
                    />
                    <div className='min-w-0 flex-1'>
                      <Link
                        href={l.slug ? `/perfil/${l.slug}` : '#'}
                        className='font-pt-mono truncate text-xs font-bold text-white hover:text-red-300'
                      >
                        {l.display_name ?? 'Usuario'}
                      </Link>
                      <p className='font-pt-mono text-[10px] text-white/40'>
                        {l.unique_songs} {l.unique_songs === 1 ? 'rola distinta' : 'rolas distintas'}
                        {l.most_played_count && l.most_played_count > 1
                          ? ` · la más escuchada, ${l.most_played_count} veces`
                          : ''}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-baby-doll text-xl font-bold text-red-400'>
                        {l.total_plays.toLocaleString('es-MX')}
                      </p>
                      <p className='font-pt-mono text-[9px] tracking-widest text-white/30 uppercase'>plays</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ul>
          )}
        </div>

        <div>
          <SectionHeader
            icon={Send}
            title='Top sugerencias'
            description='Quién manda más rolas y cuántas se aceptan.'
          />
          {topProposers.length === 0 ? (
            <EmptyCard text='Aún no hay propuestas registradas.' />
          ) : (
            <ul className='space-y-2'>
              {topProposers.map((p, i) => {
                const reviewed = Number(p.accepted) + Number(p.rejected)
                return (
                  <Card
                    key={p.user_id}
                    className='gap-0 border-white/10 bg-white/3 py-0'
                  >
                    <CardContent className='flex items-center gap-3 p-3'>
                      <span className='font-baby-doll w-6 shrink-0 text-center text-2xl text-white/30'>{i + 1}</span>
                      <ProfileAvatar
                        photo={p.photo_url}
                        name={p.display_name ?? 'Usuario'}
                      />
                      <div className='min-w-0 flex-1'>
                        <Link
                          href={p.slug ? `/perfil/${p.slug}` : '#'}
                          className='font-pt-mono truncate text-xs font-bold text-white hover:text-red-300'
                        >
                          {p.display_name ?? 'Usuario'}
                        </Link>
                        <p className='font-pt-mono text-[10px] text-white/40'>
                          <span className='text-emerald-400'>{p.accepted} ✓</span>
                          {' · '}
                          <span className='text-white/30'>{p.rejected} ✗</span>
                          {' · '}
                          <span className='text-amber-400'>{p.pending} ⏳</span>
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-baby-doll text-xl font-bold text-emerald-400'>{p.total_proposals}</p>
                        <p className='font-pt-mono text-[9px] tracking-widest text-white/30 uppercase'>
                          {reviewed > 0 ? `${Number(p.acceptance_rate)}% de ${reviewed} rev.` : 'Sin revisar'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </ul>
          )}
        </div>
      </section>
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

function EmptyCard({ text }: { text: string }) {
  return (
    <Card className='border-dashed border-white/10 bg-transparent py-10'>
      <CardContent className='font-pt-mono text-center text-xs text-white/30'>{text}</CardContent>
    </Card>
  )
}

function ProfileAvatar({ photo, name }: { photo: string | null; name: string }) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        className='h-9 w-9 shrink-0 rounded-full object-cover'
      />
    )
  }
  return (
    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-white/50'>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

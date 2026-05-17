import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Card, CardContent } from '@/app/components/ui/card'
import { Separator } from '@/app/components/ui/separator'
import { createServiceClient } from '@/lib/supabase/service'
import { BarChart3, Headphones, Heart, Music2, Play, Send, Users } from 'lucide-react'
import Link from 'next/link'
import { CassetteFilter, type CassetteOption } from './_components/CassetteFilter'
import { CassettesTable, type CassetteMetricRow } from './_components/CassettesTable'
import { SongsTable, type SongMetricRow } from './_components/SongsTable'

export const metadata = {
  title: 'Analytics · Admin · Ruidozo MX'
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

interface ConnectionMetrics {
  total_interests: number
  unique_interest_givers: number
  unique_interest_receivers: number
  total_user_proposals: number
  unique_proposers: number
  unique_proposed_to: number
}

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: Promise<{ cassette?: string }>
}) {
  const { cassette: cassetteParam } = await searchParams
  const cassetteFilter = cassetteParam && cassetteParam !== 'all' ? cassetteParam : null

  const svc = createServiceClient()

  // Cassette list is always unfiltered (used by the selector).
  const cassetteListPromise = svc
    .from('cassettes')
    .select('id, name, active, archived, is_next')
    .order('start_date', { ascending: false })

  const [songMetricsRes, cassetteMetricsRes, listenersRes, proposersRes, connectionsRes, cassetteListRes] =
    await Promise.all([
      svc.rpc('song_metrics', { p_cassette_id: cassetteFilter }),
      svc.rpc('cassette_metrics', { p_cassette_id: cassetteFilter }),
      svc.rpc('top_listeners', { p_limit: 10 }),
      svc.rpc('top_proposers', { p_limit: 10 }),
      svc.rpc('connection_metrics'),
      cassetteListPromise
    ])

  const songMetrics = (songMetricsRes.data ?? []) as SongMetricRow[]
  const cassetteMetrics = (cassetteMetricsRes.data ?? []) as CassetteMetricRow[]
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

  const cassetteOptions: CassetteOption[] = (cassetteListRes.data ?? []).map(c => ({
    id: c.id,
    name: c.name ?? 'Sin nombre',
    state: c.active ? 'active' : c.is_next ? 'next' : c.archived ? 'archived' : 'draft'
  }))

  const selectedCassetteName = cassetteFilter
    ? (cassetteOptions.find(c => c.id === cassetteFilter)?.name ?? 'Cassette seleccionado')
    : null

  const totalPlays = songMetrics.reduce((acc, s) => acc + Number(s.plays_total), 0)
  const totalAuthPlays = songMetrics.reduce((acc, s) => acc + Number(s.plays_authenticated), 0)
  const totalSessionsStarted = cassetteMetrics.reduce((acc, c) => acc + Number(c.sessions_started), 0)
  const totalUniqueListeners = new Set(topListeners.map(l => l.user_id)).size

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
            Analytics
          </h1>
          <p className='font-pt-mono mt-2 max-w-2xl text-xs text-white/50'>
            Cómo está conectando la gente con el contenido. Mide reproducciones, sesiones y participación — tanto de
            usuarios logueados como de visitantes anónimos.
          </p>
          {selectedCassetteName && (
            <p className='font-pt-mono mt-2 text-[11px] text-white/40'>
              Filtrando por <strong className='text-white'>{selectedCassetteName}</strong>. Las secciones de fans y
              proponentes son globales.
            </p>
          )}
        </div>
        <CassetteFilter
          options={cassetteOptions}
          selected={cassetteFilter ?? 'all'}
        />
      </header>

      {!hasAnyData && (
        <Alert className='border-amber-400/20 bg-amber-500/5 text-amber-200'>
          <AlertDescription className='font-pt-mono text-amber-200'>
            {cassetteFilter
              ? 'Este cassette no tiene eventos registrados aún.'
              : 'Aún no hay eventos registrados. Los plays, sesiones y clicks empezarán a aparecer aquí en cuanto la gente interactúe con el cassette activo.'}
          </AlertDescription>
        </Alert>
      )}

      <section className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
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
          value={Math.max(totalUniqueListeners, topProposers.length).toLocaleString('es-MX')}
          sub={`${topProposers.length} proponentes`}
          icon={Users}
          accent='emerald'
        />
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
          description='Plays totales, oyentes únicos, % que completan, e interacciones derivadas. Filtra por lado o busca por banda/título.'
        />
        <SongsTable rows={songMetrics} />
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
                        {l.unique_songs} canciones distintas
                        {l.most_played_count ? ` · top repite x${l.most_played_count}` : ''}
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
            title='Top proponentes'
            description='Quién manda más rolas y cuántas se aceptan.'
          />
          {topProposers.length === 0 ? (
            <EmptyCard text='Aún no hay propuestas registradas.' />
          ) : (
            <ul className='space-y-2'>
              {topProposers.map((p, i) => (
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
                        {Number(p.acceptance_rate)}% acep.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <SectionHeader
          icon={Heart}
          title='Conexiones entre usuarios'
          description='Solicitudes de "Conectar" + propuestas directas entre perfiles.'
        />
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
          <SmallStat
            label='Total solicitudes'
            value={connections.total_interests}
          />
          <SmallStat
            label='Quién las envía'
            value={connections.unique_interest_givers}
          />
          <SmallStat
            label='Quién las recibe'
            value={connections.unique_interest_receivers}
          />
          <SmallStat
            label='Mensajes directos'
            value={connections.total_user_proposals}
          />
          <SmallStat
            label='Quién manda mensajes'
            value={connections.unique_proposers}
          />
          <SmallStat
            label='Quién los recibe'
            value={connections.unique_proposed_to}
          />
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
  accent: 'red' | 'blue' | 'pink' | 'emerald'
}) {
  const tints = {
    red: 'border-red-500/20 bg-red-500/5 text-red-300',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-300',
    pink: 'border-pink-500/20 bg-pink-500/5 text-pink-300',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
  }[accent]
  return (
    <Card className={`gap-2 border py-4 ${tints}`}>
      <CardContent className='px-4'>
        <div className='mb-2 flex items-center justify-between'>
          <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase'>{label}</p>
          <Icon className='h-3.5 w-3.5 opacity-60' />
        </div>
        <p className='font-baby-doll text-3xl font-bold tracking-wider text-white uppercase sm:text-4xl'>{value}</p>
        <p className='font-pt-mono mt-1 text-[10px] text-white/50'>{sub}</p>
      </CardContent>
    </Card>
  )
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <Card className='gap-1 border-white/10 bg-white/3 py-3'>
      <CardContent className='px-3'>
        <p className='font-pt-mono text-[10px] tracking-widest text-white/40 uppercase'>{label}</p>
        <p className='font-baby-doll mt-1 text-2xl font-bold text-white'>{value.toLocaleString('es-MX')}</p>
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

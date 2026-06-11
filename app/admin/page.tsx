import { Card, CardContent } from '@/app/components/ui/card'
import { createServiceClient } from '@/lib/supabase/service'
import { CalendarClock, CalendarDays, Disc3, Heart, Inbox, Music2, Sparkles, Users } from 'lucide-react'
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
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
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
    <div className='mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-12'>
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

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Cassette activo'
          value={activeCassette?.name ?? '—'}
          sub={activeCassette ? `${activeFilled}/26 slots` : 'Ninguno'}
          accent='red'
          icon={Disc3}
          href='/admin/cassettes'
        />
        <StatCard
          label='Cassette siguiente'
          value={nextCassette?.name ?? 'Sin definir'}
          sub={nextCassette ? `${nextFilled}/26 slots` : 'Crea uno en Cassettes'}
          accent='amber'
          icon={Sparkles}
          href='/admin/cassettes'
        />
        <StatCard
          label='Propuestas pendientes'
          value={String(pendingCount ?? 0)}
          sub={`de ${totalProposals ?? 0} totales`}
          accent='emerald'
          icon={Inbox}
          href='/admin/propuestas'
        />
        <StatCard
          label='Eventos publicados'
          value={String(publishedEvents ?? 0)}
          sub='visibles al público'
          accent='amber'
          icon={CalendarDays}
          href='/admin/eventos'
        />
        <StatCard
          label='Eventos próximos'
          value={String(upcomingEvents ?? 0)}
          sub='por venir'
          accent='emerald'
          icon={CalendarClock}
          href='/admin/eventos'
        />
        <StatCard
          label='Conexiones'
          value={String(totalConnections)}
          sub={`${totalInterests ?? 0} intereses · ${totalMessages ?? 0} mensajes`}
          accent='red'
          icon={Heart}
          href='/admin/conexiones'
        />
        <StatCard
          label='Bandas'
          value={String(totalBands ?? 0)}
          sub={`de ${totalUsers ?? 0} usuarios`}
          accent='neutral'
          icon={Music2}
        />
        <StatCard
          label='Usuarios'
          value={String(totalUsers ?? 0)}
          sub='registrados'
          accent='neutral'
          icon={Users}
        />
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon: Icon,
  href
}: {
  label: string
  value: string
  sub: string
  accent: 'red' | 'amber' | 'emerald' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  href?: string
}) {
  const accentCls = {
    red: 'border-red-500/20 bg-red-500/5',
    amber: 'border-amber-400/20 bg-amber-500/5',
    emerald: 'border-emerald-400/20 bg-emerald-500/5',
    neutral: 'border-white/10 bg-white/[0.04]'
  }[accent]
  const iconCls = {
    red: 'text-red-400 bg-red-500/10',
    amber: 'text-amber-300 bg-amber-500/10',
    emerald: 'text-emerald-300 bg-emerald-500/10',
    neutral: 'text-white/50 bg-white/5'
  }[accent]

  const inner = (
    <Card className={`gap-3 border py-5 transition-colors ${accentCls} ${href ? 'hover:bg-white/6' : ''}`}>
      <CardContent>
        <div className='flex items-center justify-between'>
          <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase'>{label}</p>
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconCls}`}>
            <Icon className='h-3.5 w-3.5' />
          </div>
        </div>
        <p className='font-baby-doll mt-3 truncate text-2xl font-bold text-white uppercase'>{value}</p>
        <p className='font-pt-mono mt-1 text-xs text-white/40'>{sub}</p>
      </CardContent>
    </Card>
  )

  return href ? (
    <Link
      href={href}
      className='block'
    >
      {inner}
    </Link>
  ) : (
    inner
  )
}

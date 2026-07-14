import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { formatShortDateMX } from '@/lib/utils'
import { Archive, ChevronRight, Disc3, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { EmptyState, LabelTag, PageHeader, Paper, SectionHeading, Stamp } from '../_components/kit'
import { CreateCassetteModal } from './_components/CreateCassetteModal'

export default async function AdminCassettesPage() {
  const supabase = await createClient()

  const { data: cassettes } = await supabase
    .from('cassettes')
    .select('id, name, start_date, end_date, active, archived, is_next, curator_name, created_at')
    .order('active', { ascending: false })
    .order('is_next', { ascending: false })
    .order('archived', { ascending: true })
    .order('created_at', { ascending: false })

  const ids = (cassettes ?? []).map(c => c.id)
  const songsByCassette: Record<string, number> = {}
  if (ids.length) {
    const { data: songRows } = await supabase.from('songs').select('cassette_id').in('cassette_id', ids)
    for (const r of songRows ?? []) {
      songsByCassette[r.cassette_id] = (songsByCassette[r.cassette_id] ?? 0) + 1
    }
  }

  // cassettes.total_plays is a dead denormalized column (DEFAULT 0, nothing
  // maintains it). Get real counts from the SQL aggregate, which also sidesteps
  // PostgREST's 1000-row cap on raw song_events.
  const svc = createServiceClient()
  const { data: cassetteMetrics } = await svc.rpc('cassette_metrics', { p_since: null, p_cassette_id: null })
  const playsByCassette: Record<string, number> = {}
  for (const m of (cassetteMetrics ?? []) as { cassette_id: string; total_plays: number }[]) {
    playsByCassette[m.cassette_id] = Number(m.total_plays)
  }

  const active = cassettes?.find(c => c.active)
  const next = cassettes?.find(c => c.is_next)
  const drafts = (cassettes ?? []).filter(c => !c.active && !c.archived && !c.is_next)
  const archived = (cassettes ?? []).filter(c => c.archived)

  return (
    <div className='mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-12'>
      <PageHeader
        eyebrow='Trinchera · Catálogo'
        title='Cassettes'
        description={
          <>
            Crea, cura y publica cassettes. Solo uno puede estar{' '}
            <strong className='text-admin-red'>activo</strong> y uno marcado como{' '}
            <strong className='text-admin-gold'>siguiente</strong> (donde caen las propuestas aceptadas).
          </>
        }
        action={<CreateCassetteModal />}
      />

      <section className='grid gap-4 lg:grid-cols-2'>
        <FeaturedCard
          title='Activo'
          subtitle='Suena en la home'
          accent='red'
          icon={Disc3}
          cassette={active}
          songCount={active ? (songsByCassette[active.id] ?? 0) : 0}
          plays={active ? (playsByCassette[active.id] ?? 0) : 0}
        />
        <FeaturedCard
          title='Siguiente'
          subtitle='Recibe propuestas aceptadas'
          accent='gold'
          icon={Sparkles}
          cassette={next}
          songCount={next ? (songsByCassette[next.id] ?? 0) : 0}
          plays={next ? (playsByCassette[next.id] ?? 0) : 0}
        />
      </section>

      {drafts.length > 0 && (
        <section className='space-y-3'>
          <SectionHeading title={`Borradores (${drafts.length})`} />
          <div className='space-y-2'>
            {drafts.map(c => (
              <CassetteRow
                key={c.id}
                cassette={c}
                songCount={songsByCassette[c.id] ?? 0}
              />
            ))}
          </div>
        </section>
      )}

      {archived.length > 0 && (
        <section className='space-y-3'>
          <SectionHeading
            icon={Archive}
            title={`Archivados (${archived.length})`}
          />
          <div className='space-y-2 opacity-60'>
            {archived.map(c => (
              <CassetteRow
                key={c.id}
                cassette={c}
                songCount={songsByCassette[c.id] ?? 0}
              />
            ))}
          </div>
        </section>
      )}

      {(!cassettes || cassettes.length === 0) && (
        <EmptyState
          icon={Disc3}
          action={<CreateCassetteModal />}
        >
          Aún no hay cassettes. Crea el primero.
        </EmptyState>
      )}
    </div>
  )
}

type CassetteRowData = {
  id: string
  name: string | null
  start_date: string
  end_date: string
  active: boolean
  archived: boolean
  is_next: boolean
  curator_name: string | null
  created_at: string
}

function FeaturedCard({
  title,
  subtitle,
  accent,
  icon: Icon,
  cassette,
  songCount,
  plays
}: {
  title: string
  subtitle: string
  accent: 'red' | 'gold'
  icon: React.ComponentType<{ className?: string }>
  cassette: CassetteRowData | undefined
  songCount: number
  plays: number
}) {
  const accentText = accent === 'red' ? 'text-admin-red' : 'text-admin-gold'
  const iconBorder = accent === 'red' ? 'border-admin-red text-admin-red' : 'border-admin-gold text-admin-gold'

  if (!cassette) {
    return (
      <Paper
        tone={accent}
        flat
        className='flex flex-col gap-3 border-dashed p-5 opacity-70'
      >
        <div className='flex items-center gap-3'>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 opacity-60 ${iconBorder}`}>
            <Icon className='h-5 w-5' />
          </div>
          <div>
            <LabelTag tone={accent}>{title}</LabelTag>
            <p className='font-pt-mono text-admin-ink-faint mt-1.5 text-sm'>Sin definir</p>
          </div>
        </div>
        <p className='font-pt-mono text-admin-ink-soft text-xs'>{subtitle}</p>
      </Paper>
    )
  }

  return (
    <Link
      href={`/admin/cassettes/${cassette.id}`}
      className='group block'
    >
      <Paper
        tone={accent}
        className='admin-press p-5'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 ${iconBorder}`}>
              <Icon className='h-5 w-5' />
            </div>
            <div className='min-w-0'>
              <LabelTag tone={accent}>{title}</LabelTag>
              <p className='font-baby-doll text-admin-ink mt-1.5 truncate text-2xl font-bold uppercase'>
                {cassette.name}
              </p>
            </div>
          </div>
          <ChevronRight className='text-admin-ink/30 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1' />
        </div>

        <div className='font-pt-mono text-admin-ink-soft mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
          <span>
            <strong className='text-admin-ink'>{songCount}</strong>/{Math.max(26, songCount)} slots
          </span>
          {cassette.curator_name && (
            <span>
              Curador: <strong className='text-admin-ink'>{cassette.curator_name}</strong>
            </span>
          )}
          <span className={`tabular-nums ${accentText}`}>{plays.toLocaleString('es-MX')} plays</span>
        </div>
      </Paper>
    </Link>
  )
}

function CassetteRow({ cassette, songCount }: { cassette: CassetteRowData; songCount: number }) {
  return (
    <Link
      href={`/admin/cassettes/${cassette.id}`}
      className='admin-card-flat admin-press group flex items-center justify-between gap-4 px-5 py-4'
    >
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <p className='font-pt-mono text-admin-ink truncate text-sm font-bold uppercase'>{cassette.name}</p>
          {cassette.archived && <Stamp tone='ink'>Archivado</Stamp>}
        </div>
        <p className='font-pt-mono text-admin-ink-faint mt-1 text-[11px]'>
          {songCount}/{Math.max(26, songCount)} slots
          {cassette.curator_name && ` · ${cassette.curator_name}`}
          {' · '}
          {formatShortDateMX(cassette.start_date)} — {formatShortDateMX(cassette.end_date)}
        </p>
      </div>
      <ChevronRight className='text-admin-ink/30 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1' />
    </Link>
  )
}

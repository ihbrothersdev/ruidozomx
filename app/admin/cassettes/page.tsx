import { Card, CardContent } from '@/app/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatShortDateMX } from '@/lib/utils'
import { Archive, ChevronRight, Disc3, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { CreateCassetteModal } from './_components/CreateCassetteModal'

export default async function AdminCassettesPage() {
  const supabase = await createClient()

  const { data: cassettes } = await supabase
    .from('cassettes')
    .select('id, name, start_date, end_date, active, archived, is_next, curator_name, total_plays, created_at')
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

  const active = cassettes?.find(c => c.active)
  const next = cassettes?.find(c => c.is_next)
  const drafts = (cassettes ?? []).filter(c => !c.active && !c.archived && !c.is_next)
  const archived = (cassettes ?? []).filter(c => c.archived)

  return (
    <div className='mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-12'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='font-pt-mono text-xs tracking-[0.3em] text-red-400/70 uppercase'>Catálogo</p>
          <h1 className='font-baby-doll mt-1 text-4xl font-bold tracking-wider text-white uppercase sm:text-5xl'>
            Cassettes
          </h1>
          <p className='font-pt-mono mt-2 max-w-xl text-sm text-white/40'>
            Crea, cura y publica cassettes. Solo uno puede estar <strong className='text-red-300'>activo</strong> y uno
            marcado como <strong className='text-amber-300'>siguiente</strong> (donde caen las propuestas aceptadas).
          </p>
        </div>
        <CreateCassetteModal />
      </header>

      <section className='grid gap-4 lg:grid-cols-2'>
        <FeaturedCard
          title='Activo'
          subtitle='Suena en la home'
          accent='red'
          icon={Disc3}
          cassette={active}
          songCount={active ? (songsByCassette[active.id] ?? 0) : 0}
        />
        <FeaturedCard
          title='Siguiente'
          subtitle='Recibe propuestas aceptadas'
          accent='amber'
          icon={Sparkles}
          cassette={next}
          songCount={next ? (songsByCassette[next.id] ?? 0) : 0}
        />
      </section>

      {drafts.length > 0 && (
        <section>
          <h2 className='font-pt-mono mb-3 text-xs font-bold tracking-[0.3em] text-white/40 uppercase'>
            Borradores ({drafts.length})
          </h2>
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
        <section>
          <h2 className='font-pt-mono mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-white/40 uppercase'>
            <Archive className='h-3 w-3' />
            Archivados ({archived.length})
          </h2>
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
        <Card className='border-dashed border-white/10 bg-transparent py-16'>
          <CardContent className='font-pt-mono flex flex-col items-center gap-4 text-center'>
            <p className='text-sm text-white/40'>Aún no hay cassettes. Crea el primero.</p>
            <CreateCassetteModal />
          </CardContent>
        </Card>
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
  total_plays: number
  created_at: string
}

function FeaturedCard({
  title,
  subtitle,
  accent,
  icon: Icon,
  cassette,
  songCount
}: {
  title: string
  subtitle: string
  accent: 'red' | 'amber'
  icon: React.ComponentType<{ className?: string }>
  cassette: CassetteRowData | undefined
  songCount: number
}) {
  const accentCls = accent === 'red' ? 'border-red-500/30 bg-red-500/10' : 'border-amber-400/30 bg-amber-500/10'
  const iconCls = accent === 'red' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'

  if (!cassette) {
    return (
      <Card className={`border-dashed py-6 ${accentCls.replace('/30', '/15').replace('/10', '/5')}`}>
        <CardContent className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconCls} opacity-50`}>
              <Icon className='h-5 w-5' />
            </div>
            <div>
              <p className='font-pt-mono text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase'>{title}</p>
              <p className='font-pt-mono mt-1 text-sm text-white/30'>Sin definir</p>
            </div>
          </div>
          <p className='font-pt-mono text-xs text-white/40'>{subtitle}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`group gap-3 border py-6 transition-all hover:bg-white/6 ${accentCls}`}>
      <CardContent>
        <Link
          href={`/admin/cassettes/${cassette.id}`}
          className='block'
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconCls}`}>
                <Icon className='h-5 w-5' />
              </div>
              <div>
                <p className='font-pt-mono text-[10px] font-bold tracking-[0.3em] text-white/50 uppercase'>{title}</p>
                <p className='font-baby-doll mt-1 truncate text-2xl font-bold text-white uppercase'>{cassette.name}</p>
              </div>
            </div>
            <ChevronRight className='h-5 w-5 text-white/30 transition-transform group-hover:translate-x-1' />
          </div>

          <div className='font-pt-mono mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50'>
            <span>
              <strong className='text-white'>{songCount}</strong>/{Math.max(26, songCount)} slots
            </span>
            {cassette.curator_name && (
              <span>
                Curador: <strong className='text-white/80'>{cassette.curator_name}</strong>
              </span>
            )}
            <span>{cassette.total_plays} plays</span>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}

function CassetteRow({ cassette, songCount }: { cassette: CassetteRowData; songCount: number }) {
  return (
    <Card className='group gap-0 border-white/10 bg-white/3 py-0 transition-colors hover:border-white/20 hover:bg-white/6'>
      <CardContent className='p-0'>
        <Link
          href={`/admin/cassettes/${cassette.id}`}
          className='flex items-center justify-between gap-4 px-5 py-4'
        >
          <div className='min-w-0 flex-1'>
            <p className='font-pt-mono truncate text-sm font-bold text-white uppercase'>{cassette.name}</p>
            <p className='font-pt-mono mt-1 text-[11px] text-white/40'>
              {songCount}/{Math.max(26, songCount)} slots
              {cassette.curator_name && ` · ${cassette.curator_name}`}
              {' · '}
              {formatShortDateMX(cassette.start_date)} — {formatShortDateMX(cassette.end_date)}
            </p>
          </div>
          <ChevronRight className='h-4 w-4 text-white/30 transition-transform group-hover:translate-x-1' />
        </Link>
      </CardContent>
    </Card>
  )
}

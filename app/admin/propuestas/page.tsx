import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardFooter } from '@/app/components/ui/card'
import { Separator } from '@/app/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import type { ProposalStatus } from '@/lib/types'
import { formatLongDateMX, formatShortDateMX } from '@/lib/utils'
import { AlertCircle, ExternalLink, Music2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FilterTabs } from './_components/FilterTabs'
import { InlinePlayer } from './_components/InlinePlayer'
import { ProposalActions } from './_components/ProposalActions'
import { ProposalEmbed } from './_components/ProposalEmbed'
import { SearchAndDateFilters } from './_components/SearchAndDateFilters'
import type { OccupiedSlot } from './_components/SlotPicker'

const FILTERS = ['pending', 'selected', 'rejected', 'all'] as const
type Filter = (typeof FILTERS)[number]

interface SearchParams {
  f?: string
  q?: string
  from?: string
  to?: string
}

const STATUS_BADGE: Record<ProposalStatus, { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  in_review: { label: 'En revisión', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  selected: { label: 'Aceptada', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  rejected: { label: 'Rechazada', cls: 'bg-white/10 text-white/50 border-white/15' }
}

export default async function AdminProposalsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const filter: Filter = (FILTERS as readonly string[]).includes(params.f ?? '') ? (params.f as Filter) : 'pending'
  const search = (params.q ?? '').trim()
  const from = (params.from ?? '').trim()
  const to = (params.to ?? '').trim()

  const supabase = await createClient()

  const { data: nextCassette } = await supabase
    .from('cassettes')
    .select('id, name, active, archived, is_next')
    .eq('is_next', true)
    .maybeSingle()
  const { data: activeCassette } = await supabase
    .from('cassettes')
    .select('id, name, active, archived, is_next')
    .eq('active', true)
    .maybeSingle()

  const target = nextCassette ?? activeCassette
  const targetState: 'next' | 'active' | null = target?.is_next ? 'next' : target?.active ? 'active' : null

  const { data: targetSongs } = target
    ? await supabase.from('songs').select('id, title, artist, side, position').eq('cassette_id', target.id)
    : { data: [] as Array<{ id: string; title: string; artist: string; side: 'A' | 'B'; position: number }> }

  const occupied: OccupiedSlot[] = (targetSongs ?? []).map(s => ({
    side: s.side,
    position: s.position,
    title: s.title,
    artist: s.artist
  }))

  const { data: countsRows } = await supabase.from('song_proposals').select('status')
  const counts: Record<Filter, number> = { pending: 0, selected: 0, rejected: 0, all: countsRows?.length ?? 0 }
  for (const r of countsRows ?? []) {
    const s = r.status as ProposalStatus
    if (s === 'pending' || s === 'selected' || s === 'rejected') counts[s]++
  }

  let query = supabase
    .from('song_proposals')
    .select('*, profiles!song_proposals_user_id_fkey(display_name, slug, photo_url)')
    .order('created_at', { ascending: false })
  if (filter !== 'all') query = query.eq('status', filter)
  if (search) {
    const escaped = search.replace(/[%_,]/g, m => `\\${m}`)
    query = query.or(`artist.ilike.%${escaped}%,title.ilike.%${escaped}%`)
  }
  if (from) query = query.gte('created_at', `${from}T00:00:00`)
  if (to) query = query.lte('created_at', `${to}T23:59:59`)
  const { data: proposals } = await query

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-8 sm:py-12'>
      <header>
        <p className='font-pt-mono text-xs tracking-[0.3em] text-red-400/70 uppercase'>Curaduría</p>
        <h1 className='font-baby-doll mt-1 text-4xl font-bold tracking-wider text-white uppercase sm:text-5xl'>
          Propuestas
        </h1>
      </header>

      {target ? (
        <Card
          className={`gap-2 border py-5 ${
            targetState === 'active' ? 'border-red-500/30 bg-red-500/10' : 'border-amber-400/30 bg-amber-500/10'
          }`}
        >
          <CardContent className='flex flex-wrap items-center justify-between gap-3'>
            <div className='min-w-0'>
              <p className='font-pt-mono text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase'>
                Aceptando para
              </p>
              <p className='font-baby-doll mt-1 flex items-center gap-2 truncate text-2xl font-bold text-white uppercase'>
                {target.name}
                <Badge
                  className={`tracking-widest ${
                    targetState === 'active' ? 'bg-red-500/30 text-red-200' : 'bg-amber-500/30 text-amber-200'
                  }`}
                >
                  {targetState === 'active' ? 'ACTIVO · SUENA AHORA' : 'SIGUIENTE'}
                </Badge>
              </p>
              <p className='font-pt-mono mt-2 text-xs text-white/50'>
                <strong className='text-white'>{occupied.length}</strong>/26 slots ocupados
              </p>
            </div>

            {targetState === 'active' && (
              <Alert className='max-w-md border-amber-400/30 bg-black/30 text-amber-300'>
                <AlertCircle />
                <AlertTitle className='font-pt-mono text-[11px] tracking-wide text-amber-200'>
                  Cassette activo
                </AlertTitle>
                <AlertDescription className='font-pt-mono text-[11px] text-amber-300/80'>
                  <p>
                    Estás metiendo rolas al que está sonando. Crea uno nuevo en{' '}
                    <Link
                      href='/admin/cassettes'
                      className='underline hover:text-amber-200'
                    >
                      Cassettes
                    </Link>{' '}
                    y márcalo como siguiente.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert className='border-amber-400/30 bg-amber-500/10 text-amber-200'>
          <AlertCircle />
          <AlertTitle className='font-pt-mono text-amber-200'>No hay cassette destino</AlertTitle>
          <AlertDescription className='font-pt-mono mt-2 flex items-center gap-3 text-amber-200/80'>
            <span>Crea uno primero para empezar a aceptar propuestas.</span>
            <Button
              asChild
              size='sm'
              className='bg-amber-500 text-black hover:bg-amber-400'
            >
              <Link href='/admin/cassettes'>
                <Music2 className='h-3.5 w-3.5' />
                Ir a Cassettes
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <FilterTabs counts={counts} />
      <SearchAndDateFilters />

      {!proposals || proposals.length === 0 ? (
        <Card className='border-dashed border-white/10 bg-transparent py-16'>
          <CardContent className='font-pt-mono text-center text-white/30'>
            {filter === 'pending'
              ? 'No hay propuestas pendientes. ✓'
              : filter === 'selected'
                ? 'Aún no hay propuestas aceptadas.'
                : filter === 'rejected'
                  ? 'Aún no hay propuestas rechazadas.'
                  : 'No hay propuestas todavía.'}
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {proposals.map(p => {
            const proposer = p.profiles as { display_name?: string; slug?: string; photo_url?: string } | null
            const status = STATUS_BADGE[p.status as ProposalStatus] ?? STATUS_BADGE.pending
            return (
              <Card
                key={p.id}
                className={`gap-0 overflow-hidden border bg-white/4 py-0 ${
                  p.status === 'rejected' ? 'border-white/5 opacity-60' : 'border-white/10'
                }`}
              >
                <CardContent className='space-y-4 p-5 sm:p-6'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='font-pt-mono text-base font-bold text-white'>{p.artist}</h3>
                        <Badge
                          variant='outline'
                          className={`font-pt-mono tracking-widest uppercase ${status.cls}`}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      {p.title && <p className='font-pt-mono mt-1 text-sm text-white/40'>{p.title}</p>}

                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        {p.genre && (
                          <Badge
                            variant='secondary'
                            className='font-pt-mono bg-white/10 text-[11px] text-white/50'
                          >
                            {p.genre}
                          </Badge>
                        )}
                        {p.external_link && (
                          <Button
                            asChild
                            variant='link'
                            size='xs'
                            className='font-pt-mono h-auto p-0 text-[11px] font-bold text-red-400 hover:text-red-300'
                          >
                            <a
                              href={p.external_link}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              Link público <ExternalLink className='h-3 w-3' />
                            </a>
                          </Button>
                        )}
                        {p.audio_file_path && (
                          <Button
                            asChild
                            variant='link'
                            size='xs'
                            className='font-pt-mono h-auto p-0 text-[11px] font-bold text-red-400 hover:text-red-300'
                          >
                            <a
                              href={p.audio_file_path}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              Descargar <ExternalLink className='h-3 w-3' />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className='shrink-0 text-right'>
                      {proposer && (
                        <div className='mb-1 flex items-center justify-end gap-2'>
                          {proposer.photo_url && (
                            <Image
                              src={proposer.photo_url}
                              alt=''
                              width={24}
                              height={24}
                              className='h-6 w-6 rounded-full object-cover'
                              unoptimized
                            />
                          )}
                          <Link
                            href={`/perfil/${proposer.slug ?? ''}`}
                            className='font-pt-mono text-xs font-bold text-white/60 transition-colors hover:text-white'
                          >
                            {proposer.display_name ?? 'Usuario'}
                          </Link>
                        </div>
                      )}
                      <p className='font-pt-mono text-[10px] text-white/20'>{formatLongDateMX(p.created_at)}</p>
                    </div>
                  </div>

                  <div>
                    <ProposalEmbed
                      externalLink={p.external_link}
                      audioFilePath={p.audio_file_path}
                    />
                    <InlinePlayer audioUrl={p.audio_file_path} />
                  </div>

                  {p.comment && (
                    <blockquote className='font-pt-mono border-l-2 border-white/10 pl-3 text-xs text-white/40 italic'>
                      &ldquo;{p.comment}&rdquo;
                    </blockquote>
                  )}
                </CardContent>

                <Separator className='bg-white/5' />

                <CardFooter className='flex flex-col gap-3 bg-white/2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
                  <p className='font-pt-mono text-[10px] text-white/30'>
                    {p.reviewed_at ? `Revisada el ${formatShortDateMX(p.reviewed_at)}` : 'Sin revisar'}
                  </p>
                  <ProposalActions
                    proposalId={p.id}
                    proposalTitle={p.title ?? ''}
                    proposalArtist={p.artist}
                    status={p.status}
                    cassetteName={target?.name ?? null}
                    occupied={occupied}
                  />
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

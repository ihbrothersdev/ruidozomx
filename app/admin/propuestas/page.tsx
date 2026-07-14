import { createClient } from '@/lib/supabase/server'
import type { ProposalStatus } from '@/lib/types'
import { cn, formatLongDateMX, formatShortDateMX } from '@/lib/utils'
import { AlertCircle, ChevronLeft, ChevronRight, ExternalLink, Music2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminButton, EmptyState, LabelTag, Notice, PageHeader, Paper, Stamp } from '../_components/kit'
import type { Tone } from '../_components/kit'
import { FilterTabs } from './_components/FilterTabs'
import { InlinePlayer } from './_components/InlinePlayer'
import { PageJump } from './_components/PageJump'
import { ProposalActions } from './_components/ProposalActions'
import { ProposalEmbed } from './_components/ProposalEmbed'
import { SearchAndDateFilters } from './_components/SearchAndDateFilters'
import type { OccupiedSlot } from './_components/SlotPicker'

const FILTERS = ['pending', 'accepted', 'rejected', 'all'] as const
type Filter = (typeof FILTERS)[number]

interface SearchParams {
  f?: string
  q?: string
  from?: string
  to?: string
  page?: string
  ok?: string
  e?: string
  m?: string
}

const PAGE_SIZE = 10

const STATUS_STAMP: Record<ProposalStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pendiente', tone: 'gold' },
  in_review: { label: 'En revisión', tone: 'blue' },
  accepted: { label: 'Aceptada', tone: 'olive' },
  rejected: { label: 'Rechazada', tone: 'ink' }
}

export default async function AdminProposalsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const filter: Filter = (FILTERS as readonly string[]).includes(params.f ?? '') ? (params.f as Filter) : 'pending'
  const search = (params.q ?? '').trim()
  const from = (params.from ?? '').trim()
  const to = (params.to ?? '').trim()
  const pageNum = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

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
  const counts: Record<Filter, number> = { pending: 0, accepted: 0, rejected: 0, all: countsRows?.length ?? 0 }
  for (const r of countsRows ?? []) {
    const s = r.status as ProposalStatus
    if (s === 'pending' || s === 'accepted' || s === 'rejected') counts[s]++
  }

  let query = supabase
    .from('song_proposals')
    .select('*, profiles!song_proposals_user_id_fkey(display_name, slug, photo_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
  if (filter !== 'all') query = query.eq('status', filter)
  if (search) {
    const escaped = search.replace(/[%_,]/g, m => `\\${m}`)
    query = query.or(`artist.ilike.%${escaped}%,title.ilike.%${escaped}%`)
  }
  if (from) query = query.gte('created_at', `${from}T00:00:00`)
  if (to) query = query.lte('created_at', `${to}T23:59:59`)
  const fromIdx = (pageNum - 1) * PAGE_SIZE
  const { data: proposals, count: filteredCount } = await query.range(fromIdx, fromIdx + PAGE_SIZE - 1)
  const totalCount = filteredCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  function buildListing(p: number) {
    const sp = new URLSearchParams()
    if (filter !== 'pending') sp.set('f', filter)
    if (search) sp.set('q', search)
    if (from) sp.set('from', from)
    if (to) sp.set('to', to)
    if (p > 1) sp.set('page', String(p))
    return sp.toString()
  }

  function buildHref(p: number) {
    const qs = buildListing(p)
    return qs ? `/admin/propuestas?${qs}` : '/admin/propuestas'
  }

  // Overshoot (e.g. accepted the last proposal on the last page): bounce to the
  // last page that still has rows instead of rendering an empty page, keeping any toast.
  if (pageNum > totalPages) {
    const sp = new URLSearchParams(buildListing(totalPages))
    for (const k of ['ok', 'e', 'm'] as const) {
      if (params[k]) sp.set(k, params[k]!)
    }
    const qs = sp.toString()
    redirect(qs ? `/admin/propuestas?${qs}` : '/admin/propuestas')
  }

  // Carried by each row's action form so accept/reject returns the admin to this exact page + filters.
  const listing = buildListing(pageNum)
  // Same filters minus `page`, so the "jump to page" input can append any target page.
  const baseQuery = buildListing(1)

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-8 sm:py-12'>
      <PageHeader
        eyebrow='Curaduría'
        title='Propuestas'
      />

      {target ? (
        <Paper
          tone={targetState === 'active' ? 'red' : 'gold'}
          className='flex flex-wrap items-center justify-between gap-3 p-5'
        >
          <div className='min-w-0'>
            <p className='font-pt-mono text-admin-ink-faint text-[10px] font-bold tracking-[0.3em] uppercase'>
              Aceptando para
            </p>
            <p className='font-baby-doll text-admin-ink mt-1 flex items-center gap-2 truncate text-2xl font-bold uppercase'>
              {target.name}
              <Stamp tone={targetState === 'active' ? 'red' : 'gold'}>
                {targetState === 'active' ? 'ACTIVO · SUENA AHORA' : 'SIGUIENTE'}
              </Stamp>
            </p>
            <p className='font-pt-mono text-admin-ink-soft mt-2 text-xs'>
              <strong className='text-admin-ink'>{occupied.length}</strong>/{Math.max(26, occupied.length)} slots
              ocupados
            </p>
          </div>

          {targetState === 'active' && (
            <Notice
              tone='gold'
              icon={AlertCircle}
              title='Cassette activo'
              className='max-w-md'
            >
              <p>
                Estás metiendo rolas al que está sonando. Crea uno nuevo en{' '}
                <Link
                  href='/admin/cassettes'
                  className='text-admin-gold underline hover:text-admin-ink'
                >
                  Cassettes
                </Link>{' '}
                y márcalo como siguiente.
              </p>
            </Notice>
          )}
        </Paper>
      ) : (
        <Notice
          tone='gold'
          icon={AlertCircle}
          title='No hay cassette destino'
          action={
            <AdminButton
              asChild
              variant='solid'
              size='sm'
            >
              <Link href='/admin/cassettes'>
                <Music2 className='h-3.5 w-3.5' />
                Ir a Cassettes
              </Link>
            </AdminButton>
          }
        >
          Crea uno primero para empezar a aceptar propuestas.
        </Notice>
      )}

      <FilterTabs counts={counts} />
      <SearchAndDateFilters />

      {!proposals || proposals.length === 0 ? (
        <EmptyState>
          {filter === 'pending'
            ? 'No hay propuestas pendientes. ✓'
            : filter === 'accepted'
              ? 'Aún no hay propuestas aceptadas.'
              : filter === 'rejected'
                ? 'Aún no hay propuestas rechazadas.'
                : 'No hay propuestas todavía.'}
        </EmptyState>
      ) : (
        <div className='space-y-3'>
          {proposals.map(p => {
            const proposer = p.profiles as { display_name?: string; slug?: string; photo_url?: string } | null
            const status = STATUS_STAMP[p.status as ProposalStatus] ?? STATUS_STAMP.pending
            return (
              <Paper
                key={p.id}
                className={cn('overflow-hidden p-0', p.status === 'rejected' && 'opacity-60')}
              >
                <div className='space-y-4 p-5 sm:p-6'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='font-pt-mono text-admin-ink text-base font-bold'>
                          {p.title || p.artist || <span className='text-admin-ink-faint italic'>Sin título</span>}
                        </h3>
                        <Stamp tone={status.tone}>{status.label}</Stamp>
                      </div>

                      <div className='mt-3 flex flex-wrap items-center gap-2'>
                        {p.genre && <LabelTag>{p.genre}</LabelTag>}
                        {p.external_link && (
                          <a
                            href={p.external_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='font-pt-mono text-admin-red hover:text-admin-ink inline-flex items-center gap-1 text-[11px] font-bold transition-colors'
                          >
                            Link público <ExternalLink className='h-3 w-3' />
                          </a>
                        )}
                        {p.download_link && (
                          <a
                            href={p.download_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='font-pt-mono text-admin-red hover:text-admin-ink inline-flex items-center gap-1 text-[11px] font-bold transition-colors'
                          >
                            Link de descarga <ExternalLink className='h-3 w-3' />
                          </a>
                        )}
                        {p.audio_file_path && (
                          <a
                            href={p.audio_file_path}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='font-pt-mono text-admin-red hover:text-admin-ink inline-flex items-center gap-1 text-[11px] font-bold transition-colors'
                          >
                            Descargar <ExternalLink className='h-3 w-3' />
                          </a>
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
                            className='font-pt-mono text-admin-ink-soft hover:text-admin-ink text-xs font-bold transition-colors'
                          >
                            {proposer.display_name ?? 'Usuario'}
                          </Link>
                        </div>
                      )}
                      <p className='font-pt-mono text-admin-ink-faint text-[10px]'>{formatLongDateMX(p.created_at)}</p>
                    </div>
                  </div>

                  <div>
                    <ProposalEmbed
                      externalLink={p.external_link}
                      audioFilePath={p.audio_file_path}
                    />
                    <InlinePlayer
                      audioUrl={p.audio_file_path}
                      externalLink={p.external_link}
                    />
                  </div>

                  {p.comment && (
                    <blockquote className='font-pt-mono border-admin-ink/15 text-admin-ink-soft border-l-2 pl-3 text-xs italic'>
                      &ldquo;{p.comment}&rdquo;
                    </blockquote>
                  )}
                </div>

                <div className='bg-admin-ink/15 h-px' />

                <div className='bg-admin-surface-2/60 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
                  <p className='font-pt-mono text-admin-ink-faint text-[10px]'>
                    {p.reviewed_at ? `Revisada el ${formatShortDateMX(p.reviewed_at)}` : 'Pendiente de revisión'}
                  </p>
                  <ProposalActions
                    proposalId={p.id}
                    proposalTitle={p.title ?? ''}
                    proposalArtist={p.artist}
                    status={p.status}
                    cassetteName={target?.name ?? null}
                    occupied={occupied}
                    listing={listing}
                  />
                </div>
              </Paper>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <nav className='border-admin-ink/15 flex flex-wrap items-center justify-between gap-3 border-t pt-4'>
          <p className='font-pt-mono text-admin-ink-faint text-[10px] tracking-widest uppercase'>
            {fromIdx + 1}–{Math.min(pageNum * PAGE_SIZE, totalCount)} de {totalCount}
          </p>
          <div className='flex flex-wrap items-center gap-1.5'>
            <PagerLink
              href={buildHref(pageNum - 1)}
              disabled={pageNum <= 1}
            >
              <ChevronLeft className='h-4 w-4' />
            </PagerLink>
            {pageWindow(pageNum, totalPages).map((p, i) =>
              p === 'gap' ? (
                <PageJump
                  key={`gap-${i}`}
                  totalPages={totalPages}
                  baseQuery={baseQuery}
                />
              ) : (
                <PagerLink
                  key={p}
                  href={buildHref(p)}
                  active={p === pageNum}
                >
                  {p}
                </PagerLink>
              )
            )}
            <PagerLink
              href={buildHref(pageNum + 1)}
              disabled={pageNum >= totalPages}
            >
              <ChevronRight className='h-4 w-4' />
            </PagerLink>
          </div>
        </nav>
      )}
    </div>
  )
}

/** Page numbers to render, with `'gap'` markers where pages are collapsed into an ellipsis. */
function pageWindow(current: number, total: number): Array<number | 'gap'> {
  const delta = 4
  const left = Math.max(2, current - delta)
  const right = Math.min(total - 1, current + delta)
  const out: Array<number | 'gap'> = [1]
  if (left > 2) out.push('gap')
  for (let p = left; p <= right; p++) out.push(p)
  if (right < total - 1) out.push('gap')
  out.push(total)
  return out
}

function PagerLink({
  href,
  disabled,
  active,
  children
}: {
  href: string
  disabled?: boolean
  active?: boolean
  children: React.ReactNode
}) {
  const base =
    'font-pt-mono flex h-8 min-w-8 items-center justify-center border-2 border-admin-ink px-2 text-[11px] font-bold uppercase tracking-wide transition-colors'
  if (active) {
    return (
      <span
        aria-current='page'
        className={`${base} admin-hard-sm bg-admin-red text-admin-surface`}
      >
        {children}
      </span>
    )
  }
  if (disabled) {
    return (
      <span className={`${base} bg-admin-surface text-admin-ink-faint cursor-not-allowed opacity-50`}>{children}</span>
    )
  }
  return (
    <Link
      href={href}
      className={`${base} bg-admin-surface text-admin-ink hover:bg-admin-paper-deep`}
    >
      {children}
    </Link>
  )
}

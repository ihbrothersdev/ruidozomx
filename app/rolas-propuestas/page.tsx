import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CopyLinkButton } from './_components/CopyLinkButton'
import { InlinePlayer } from './_components/InlinePlayer'
import { ProposalEmbed } from './_components/ProposalEmbed'
import { acceptProposal, rejectProposal } from './actions'

export const metadata: Metadata = {
  title: 'Rolas propuestas',
  description: 'Revisa el estado de las rolas que has propuesto al cassette semanal.',
  robots: { index: false, follow: false }
}

const STATUS_CFG: Record<string, { bg: string; label: string; dot: string; ring: string }> = {
  pending: { bg: 'bg-amber-500/15 text-amber-300', label: 'Pendiente', dot: 'bg-amber-400', ring: 'ring-amber-400/30' },
  in_review: { bg: 'bg-blue-500/15 text-blue-300', label: 'En revisión', dot: 'bg-blue-400', ring: 'ring-blue-400/30' },
  selected: {
    bg: 'bg-green-500/15 text-green-300',
    label: 'Seleccionada',
    dot: 'bg-green-400',
    ring: 'ring-green-400/30'
  },
  rejected: {
    bg: 'bg-neutral-500/15 text-neutral-400',
    label: 'Rechazada',
    dot: 'bg-neutral-500',
    ring: 'ring-neutral-500/20'
  }
}

const ROLE_LABEL: Record<string, string> = {
  fan: 'Fan',
  banda: 'Banda',
  venue: 'Venue',
  proveedor: 'Proveedor',
  manager_group: 'Manager/Colectivo',
  admin: 'Admin'
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} d`
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function prettyUrl(raw: string): string {
  try {
    const u = new URL(raw)
    const host = u.hostname.replace(/^www\./, '')
    const path = u.pathname === '/' ? '' : u.pathname
    return path ? `${host}${path}` : host
  } catch {
    return raw
  }
}

export default async function RolasPropuestasPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  // Fetch proposals with proposer profile
  const { data: proposals } = await supabase
    .from('song_proposals')
    .select('*, profiles!song_proposals_user_id_fkey(display_name, slug, photo_url, role, contact)')
    .order('created_at', { ascending: false })

  const { data: cassette } = await supabase.from('cassettes').select('id, name').eq('active', true).single()

  let sideACnt = 0
  let sideBCnt = 0
  if (cassette) {
    const { count: a } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
      .eq('cassette_id', cassette.id)
      .eq('side', 'A')
    const { count: b } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
      .eq('cassette_id', cassette.id)
      .eq('side', 'B')
    sideACnt = a ?? 0
    sideBCnt = b ?? 0
  }

  const pendingCount = proposals?.filter(p => p.status === 'pending').length ?? 0
  const selectedCount = proposals?.filter(p => p.status === 'selected').length ?? 0

  return (
    <main className='relative min-h-screen bg-neutral-950'>
      {/* Dark textured bg */}
      <div
        className='fixed inset-0 z-0 opacity-20'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')", backgroundSize: 'cover' }}
      />

      <div className='relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10'>
        {/* ── Header ── */}
        <header className='mb-10'>
          <Link href='/'>
            <Image
              src='/assets/logo.png'
              alt='Ruidozo MX'
              width={380}
              height={183}
              className='mb-4 h-10 w-auto sm:h-12'
            />
          </Link>
          <h1 className='font-baby-doll text-3xl font-bold tracking-wider text-white uppercase sm:text-4xl'>
            Rolas Propuestas
          </h1>

          {/* Stats row */}
          <div className='mt-4 flex flex-wrap items-center gap-3'>
            <div className='font-pt-mono flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/60'>
              Total <strong className='text-white'>{proposals?.length ?? 0}</strong>
            </div>
            {/* <div className='font-pt-mono flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300'>
              Pendientes <strong>{pendingCount}</strong>
            </div>
            <div className='font-pt-mono flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300'>
              Aceptadas <strong>{selectedCount}</strong>
            </div> */}

            {/* Cassette pill */}
            {cassette && (
              <div className='font-pt-mono ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50'>
                <span className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
                <span>
                  {/* {cassette.name} — A:{sideACnt} B:{sideBCnt} */}
                  {cassette.name}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Error */}
        {params.error && (
          <div className='font-pt-mono mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
            {params.error}
          </div>
        )}

        {/* ── Cards ── */}
        {!proposals || proposals.length === 0 ? (
          <div className='font-pt-mono rounded-xl border border-dashed border-white/10 p-16 text-center text-white/30'>
            No hay propuestas aún.
          </div>
        ) : (
          <div className='space-y-4'>
            {proposals.map(p => {
              const status = STATUS_CFG[p.status] ?? STATUS_CFG.pending
              const proposer = p.profiles as {
                display_name?: string
                slug?: string
                photo_url?: string
                role?: string
                contact?: string
              } | null
              const roleLabel = proposer?.role ? (ROLE_LABEL[proposer.role] ?? proposer.role) : null
              const contact = proposer?.contact?.trim() || null
              const contactIsEmail = contact ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) : false
              const contactHref = contact
                ? contactIsEmail
                  ? `mailto:${contact}`
                  : /^https?:\/\//i.test(contact)
                    ? contact
                    : null
                : null

              return (
                <article
                  key={p.id}
                  className={`overflow-hidden rounded-xl border transition-all ${
                    p.status === 'rejected'
                      ? 'border-white/5 bg-white/[0.03] opacity-60'
                      : 'border-white/10 bg-white/[0.06]'
                  }`}
                >
                  {/* ── Proposer bar (who + when) ── */}
                  <div className='flex flex-wrap items-center gap-3 border-b border-white/5 bg-white/[0.03] px-5 py-3 sm:px-6'>
                    <Link
                      href={proposer?.slug ? `/perfil/${proposer.slug}` : '#'}
                      className='group flex min-w-0 items-center gap-2.5'
                    >
                      {proposer?.photo_url ? (
                        <Image
                          src={proposer.photo_url}
                          alt=''
                          width={36}
                          height={36}
                          className='h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-white/30'
                        />
                      ) : (
                        <div className='font-pt-mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60 ring-2 ring-white/10 group-hover:ring-white/30'>
                          {(proposer?.display_name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0 leading-tight'>
                        <div className='flex items-center gap-1.5'>
                          <span className='font-pt-mono truncate text-sm font-bold text-white group-hover:text-red-300'>
                            {proposer?.display_name ?? 'Usuario'}
                          </span>
                          {roleLabel && (
                            <span className='font-pt-mono shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white/50 uppercase'>
                              {roleLabel}
                            </span>
                          )}
                        </div>
                        <div className='font-pt-mono text-[11px] text-white/40'>
                          propuesta el <span title={formatAbsolute(p.created_at)}>{formatRelative(p.created_at)}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Status pill */}
                    <span
                      className={`font-pt-mono ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ring-1 ring-inset ${status.bg} ${status.ring}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* ── Song info ── */}
                  <div className='p-5 sm:p-6'>
                    <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                      <h3 className='font-baby-doll text-2xl leading-tight font-bold text-white sm:text-3xl'>
                        {p.title || <span className='text-white/30 italic'>(sin título)</span>}
                      </h3>
                      <p className='font-pt-mono text-sm text-white/60'>
                        por <span className='font-bold text-white/80'>{p.artist}</span>
                      </p>
                    </div>

                    {/* Meta row: genre + external link */}
                    <div className='mt-3 flex flex-wrap items-center gap-2'>
                      {p.genre && (
                        <span className='font-pt-mono inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/60'>
                          <span className='text-white/30'>#</span>
                          {p.genre}
                        </span>
                      )}
                      {p.external_link && (
                        <a
                          href={p.external_link}
                          target='_blank'
                          rel='noopener noreferrer'
                          title={p.external_link}
                          className='font-pt-mono inline-flex max-w-full items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-0.5 text-[11px] font-bold text-red-300 transition-colors hover:border-red-500/50 hover:bg-red-500/20 sm:max-w-[420px]'
                        >
                          <span className='truncate'>{prettyUrl(p.external_link)}</span>
                          <span className='shrink-0 opacity-70'>↗</span>
                        </a>
                      )}
                    </div>

                    {/* Private download link (Drive / Dropbox / WeTransfer) */}
                    {p.audio_file_path && (
                      <div className='mt-2'>
                        <a
                          href={p.audio_file_path}
                          target='_blank'
                          rel='noopener noreferrer'
                          title={p.audio_file_path}
                          className='font-pt-mono inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 py-0.5 pr-3 pl-1 text-[11px] font-bold text-emerald-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/20 sm:max-w-[460px]'
                        >
                          <span className='rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] tracking-wider uppercase'>
                            Descarga
                          </span>
                          <span className='truncate'>{prettyUrl(p.audio_file_path)}</span>
                          <span className='shrink-0 opacity-70'>↓</span>
                        </a>
                      </div>
                    )}

                    {/* ── Embed or inline player ── */}
                    {/* <div className='mt-4'>
                      <ProposalEmbed externalLink={p.external_link} audioFilePath={p.audio_file_path} />
                      <InlinePlayer audioUrl={p.audio_file_path} />
                    </div> */}

                    {/* Comment */}
                    {p.comment && (
                      <div className='mt-4'>
                        <div className='font-pt-mono mb-1 text-[10px] font-bold tracking-wider text-white/30 uppercase'>
                          Comentario del usuario
                        </div>
                        <blockquote className='font-pt-mono rounded-lg border-l-2 border-red-500/30 bg-white/[0.03] px-3 py-2 text-sm text-white/60 italic'>
                          &ldquo;{p.comment}&rdquo;
                        </blockquote>
                      </div>
                    )}
                  </div>

                  {/* ── Contact footer ── */}
                  {contact && (
                    <div className='flex flex-wrap items-center gap-3 border-t border-white/5 bg-white/[0.03] px-5 py-3 sm:px-6'>
                      <div className='font-pt-mono min-w-0 flex-1 text-[11px] text-white/40'>
                        <div className='font-bold tracking-wider text-white/30 uppercase'>Contacto del usuario</div>
                        <div
                          className='mt-0.5 truncate text-white/70'
                          title={contact}
                        >
                          {contact}
                        </div>
                      </div>
                      {contactHref ? (
                        <a
                          href={contactHref}
                          target={contactIsEmail ? undefined : '_blank'}
                          rel={contactIsEmail ? undefined : 'noopener noreferrer'}
                          className='font-pt-mono inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold tracking-wide text-red-300 uppercase transition-colors hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200'
                        >
                          <span>{contactIsEmail ? '✉' : '↗'}</span>
                          Contactar usuario
                        </a>
                      ) : (
                        <CopyLinkButton value={contact} />
                      )}
                    </div>
                  )}
                  {/* {p.status === 'pending' && cassette && (
                    <div className='flex flex-col gap-3 border-t border-white/5 bg-white/[0.03] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
                      <form action={acceptProposal} className='flex flex-wrap items-center gap-2'>
                        <input type='hidden' name='proposal_id' value={p.id} />
                        <select
                          name='side'
                          required
                          className='font-pt-mono h-9 appearance-none rounded-lg border border-white/10 bg-neutral-800 px-3 pr-6 text-xs text-white'
                        >
                          <option value='A'>Lado A ({sideACnt})</option>
                          <option value='B'>Lado B ({sideBCnt})</option>
                        </select>
                        <select
                          name='position'
                          required
                          defaultValue=''
                          className='font-pt-mono h-9 appearance-none rounded-lg border border-white/10 bg-neutral-800 px-3 pr-6 text-xs text-white'
                        >
                          <option value='' disabled>
                            Pos
                          </option>
                          {Array.from({ length: 13 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              #{i + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          type='submit'
                          className='font-pt-mono h-9 cursor-pointer rounded-lg bg-green-600 px-6 text-xs font-bold tracking-wide text-white uppercase transition-colors hover:bg-green-500'
                        >
                          Aceptar
                        </button>
                      </form>

                      <form action={rejectProposal}>
                        <input type='hidden' name='proposal_id' value={p.id} />
                        <button
                          type='submit'
                          className='font-pt-mono h-9 cursor-pointer rounded-lg border border-red-500/30 px-6 text-xs font-bold tracking-wide text-red-400 uppercase transition-colors hover:bg-red-500/10'
                        >
                          Rechazar
                        </button>
                      </form>
                    </div>
                  )} */}

                  {/* Reviewed stamp */}
                  {p.status !== 'pending' && p.reviewed_at && (
                    <div className='font-pt-mono border-t border-white/5 px-5 py-2 text-[10px] text-white/15 sm:px-6'>
                      Revisada el{' '}
                      {new Date(p.reviewed_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

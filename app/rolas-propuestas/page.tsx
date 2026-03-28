import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { InlinePlayer } from './_components/InlinePlayer'
import { ProposalEmbed } from './_components/ProposalEmbed'
import { acceptProposal, rejectProposal } from './actions'

const STATUS_CFG: Record<string, { bg: string; label: string; dot: string }> = {
  pending: { bg: 'bg-amber-50', label: 'Pendiente', dot: 'bg-amber-400' },
  in_review: { bg: 'bg-blue-50', label: 'En revisión', dot: 'bg-blue-400' },
  selected: { bg: 'bg-green-50', label: 'Seleccionada', dot: 'bg-green-500' },
  rejected: { bg: 'bg-neutral-100', label: 'Rechazada', dot: 'bg-neutral-400' }
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
    .select('*, profiles!song_proposals_user_id_fkey(display_name, slug, photo_url)')
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
              src='/assets/header/logo.png'
              alt='Ruidozo MX'
              width={380}
              height={183}
              className='mb-4 h-10 w-auto invert sm:h-12'
              unoptimized
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
            <div className='font-pt-mono flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300'>
              Pendientes <strong>{pendingCount}</strong>
            </div>
            <div className='font-pt-mono flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300'>
              Aceptadas <strong>{selectedCount}</strong>
            </div>

            {/* Cassette pill */}
            {cassette && (
              <div className='font-pt-mono ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50'>
                <span className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
                <span>
                  {cassette.name} — A:{sideACnt} B:{sideBCnt}
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
              const proposer = p.profiles as { display_name?: string; slug?: string; photo_url?: string } | null

              return (
                <article
                  key={p.id}
                  className={`overflow-hidden rounded-xl border transition-all ${
                    p.status === 'rejected'
                      ? 'border-white/5 bg-white/[0.03] opacity-50'
                      : 'border-white/10 bg-white/[0.06]'
                  }`}
                >
                  {/* ── Top section ── */}
                  <div className='p-5 sm:p-6'>
                    <div className='flex items-start justify-between gap-4'>
                      {/* Left: song info */}
                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <h3 className='font-pt-mono text-base font-bold text-white'>{p.artist}</h3>
                          {/* Status dot + label */}
                          <span className='inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5'>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            <span className='font-pt-mono text-[10px] font-bold text-white/60 uppercase'>
                              {status.label}
                            </span>
                          </span>
                        </div>
                        {p.title && (
                          <p className='font-pt-mono mt-1 text-sm text-white/40'>{p.title}</p>
                        )}

                        {/* Genre + links */}
                        <div className='mt-3 flex flex-wrap items-center gap-2'>
                          {p.genre && (
                            <span className='font-pt-mono rounded bg-white/10 px-2 py-0.5 text-[11px] text-white/50'>
                              {p.genre}
                            </span>
                          )}
                          {p.external_link && (
                            <a
                              href={p.external_link}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='font-pt-mono text-[11px] font-bold text-red-400 transition-colors hover:text-red-300'
                            >
                              Link público ↗
                            </a>
                          )}
                          {p.audio_file_path && (
                            <a
                              href={p.audio_file_path}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='font-pt-mono text-[11px] font-bold text-red-400 transition-colors hover:text-red-300'
                            >
                              Descargar ↗
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Right: proposer + date */}
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
                        <p className='font-pt-mono text-[10px] text-white/20'>
                          {new Date(p.created_at).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* ── Embed or inline player ── */}
                    <div className='mt-4'>
                      <ProposalEmbed externalLink={p.external_link} audioFilePath={p.audio_file_path} />
                      <InlinePlayer audioUrl={p.audio_file_path} />
                    </div>

                    {/* Comment */}
                    {p.comment && (
                      <blockquote className='font-pt-mono mt-3 border-l-2 border-white/10 pl-3 text-xs text-white/40 italic'>
                        &ldquo;{p.comment}&rdquo;
                      </blockquote>
                    )}
                  </div>

                  {/* ── Actions footer ── */}
                  {p.status === 'pending' && cassette && (
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
                  )}

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

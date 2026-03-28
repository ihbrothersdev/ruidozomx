import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { acceptProposal, rejectProposal } from './actions'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-400/90 text-black',
  in_review: 'bg-blue-500/90 text-white',
  selected: 'bg-green-500/90 text-white',
  rejected: 'bg-red-500/80 text-white'
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  selected: 'Seleccionada',
  rejected: 'Rechazada'
}

export default async function RolasPropuestasPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: proposals } = await supabase
    .from('song_proposals')
    .select('*')
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

  return (
    <main className='relative min-h-screen'>
      {/* Same paper texture as home */}
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8'>
        {/* ── Top bar ── */}
        <div className='mb-6 flex items-start justify-between'>
          <div>
            <Link href='/'>
              <Image
                src='/assets/header/logo.png'
                alt='Ruidozo MX'
                width={380}
                height={183}
                className='mb-2 h-10 w-auto sm:h-14'
                unoptimized
              />
            </Link>
            <h1 className='font-baby-doll text-2xl font-bold tracking-wider text-black uppercase sm:text-3xl'>
              Rolas Propuestas
            </h1>
          </div>

          {/* Cassette info card */}
          {cassette && (
            <div className='rounded-sm border-2 border-black/10 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm'>
              <p className='font-pt-mono text-[10px] tracking-wider text-black/40 uppercase'>Cassette activo</p>
              <p className='font-pt-mono mt-0.5 text-sm font-bold text-black'>{cassette.name}</p>
              <div className='font-pt-mono mt-1 flex gap-3 text-[11px] text-black/50'>
                <span>
                  Lado A: <strong className='text-black'>{sideACnt}</strong>
                </span>
                <span>
                  Lado B: <strong className='text-black'>{sideBCnt}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className='font-pt-mono mb-5 flex gap-4 text-xs text-black/40'>
          <span>
            Total: <strong className='text-black/70'>{proposals?.length ?? 0}</strong>
          </span>
          <span>
            Pendientes: <strong className='text-red-600'>{pendingCount}</strong>
          </span>
        </div>

        {/* Error banner */}
        {params.error && (
          <div className='font-pt-mono mb-5 rounded-sm border-2 border-red-600/30 bg-red-50 px-4 py-2.5 text-sm text-red-700'>
            {params.error}
          </div>
        )}

        {/* ── Proposals ── */}
        {!proposals || proposals.length === 0 ? (
          <div className='font-pt-mono rounded-sm border-2 border-dashed border-black/15 bg-white/40 p-12 text-center text-black/40'>
            No hay propuestas aún.
          </div>
        ) : (
          <div className='space-y-3'>
            {proposals.map(p => (
              <div
                key={p.id}
                className={`rounded-sm border-2 p-4 shadow-sm sm:p-5 ${
                  p.status === 'pending'
                    ? 'border-black/10 bg-white/70'
                    : p.status === 'selected'
                      ? 'border-green-600/20 bg-green-50/60'
                      : p.status === 'rejected'
                        ? 'border-black/5 bg-white/40 opacity-60'
                        : 'border-black/10 bg-white/60'
                }`}
              >
                <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                  {/* ── Info ── */}
                  <div className='min-w-0 flex-1 space-y-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h3 className='font-pt-mono text-sm font-bold text-black sm:text-base'>
                        {p.artist}
                        {p.title && <span className='text-black/50'> — {p.title}</span>}
                      </h3>
                      <span
                        className={`font-pt-mono inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[p.status] ?? 'bg-black/10 text-black/50'}`}
                      >
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </div>

                    {p.genre && (
                      <p className='font-pt-mono text-xs text-black/40'>
                        Género: <span className='text-black/60'>{p.genre}</span>
                      </p>
                    )}

                    <div className='flex flex-wrap gap-4'>
                      {p.external_link && (
                        <a
                          href={p.external_link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='font-pt-mono text-xs font-bold text-red-600 underline decoration-red-600/30 transition-colors hover:text-red-500'
                        >
                          Link público ↗
                        </a>
                      )}
                      {p.audio_file_path && (
                        <a
                          href={p.audio_file_path}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='font-pt-mono text-xs font-bold text-red-600 underline decoration-red-600/30 transition-colors hover:text-red-500'
                        >
                          Link privado ↗
                        </a>
                      )}
                    </div>

                    {p.comment && (
                      <p className='font-pt-mono text-xs text-black/50 italic'>&ldquo;{p.comment}&rdquo;</p>
                    )}

                    <p className='font-pt-mono text-[10px] text-black/25'>
                      {new Date(p.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* ── Actions ── */}
                  {p.status === 'pending' && cassette && (
                    <div className='flex shrink-0 flex-col gap-2 md:items-end'>
                      <form
                        action={acceptProposal}
                        className='flex items-center gap-2'
                      >
                        <input
                          type='hidden'
                          name='proposal_id'
                          value={p.id}
                        />
                        <select
                          name='side'
                          required
                          className='font-pt-mono rounded-sm border-2 border-black/15 bg-white px-2 py-1.5 text-xs text-black'
                        >
                          <option value='A'>Lado A ({sideACnt})</option>
                          <option value='B'>Lado B ({sideBCnt})</option>
                        </select>
                        <input
                          type='number'
                          name='position'
                          required
                          min={1}
                          max={20}
                          placeholder='Pos'
                          className='font-pt-mono w-16 rounded-sm border-2 border-black/15 bg-white px-2 py-1.5 text-xs text-black placeholder:text-black/30'
                        />
                        <button
                          type='submit'
                          className='font-pt-mono cursor-pointer rounded-sm bg-green-700 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wide transition-colors hover:bg-green-600'
                        >
                          Aceptar
                        </button>
                      </form>

                      <form action={rejectProposal}>
                        <input
                          type='hidden'
                          name='proposal_id'
                          value={p.id}
                        />
                        <button
                          type='submit'
                          className='font-pt-mono cursor-pointer rounded-sm border-2 border-red-600/30 px-4 py-1.5 text-xs font-bold text-red-600 uppercase tracking-wide transition-colors hover:bg-red-50'
                        >
                          Rechazar
                        </button>
                      </form>
                    </div>
                  )}

                  {p.status !== 'pending' && p.reviewed_at && (
                    <div className='font-pt-mono shrink-0 text-right text-[10px] text-black/25'>
                      Revisada:{' '}
                      {new Date(p.reviewed_at).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

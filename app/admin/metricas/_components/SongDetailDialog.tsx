'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/app/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSongDetail, type SongDetail } from '../actions'
import type { SinceWindow } from '../_lib/aggregations'

export function SongDetailDialog({
  songId,
  since,
  open,
  onOpenChange
}: {
  songId: string | null
  since: SinceWindow
  open: boolean
  onOpenChange: (next: boolean) => void
}) {
  const [data, setData] = useState<SongDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !songId) return
    setLoading(true)
    setData(null)
    setError(null)
    getSongDetail(songId, since).then(res => {
      setLoading(false)
      if (res.ok) setData(res)
      else setError(res.error)
    })
  }, [open, songId, since])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-h-[85vh] overflow-y-auto border-white/10 bg-neutral-900 text-white sm:max-w-2xl'>
        <DialogHeader>
          <p className='font-pt-mono text-[10px] tracking-[0.25em] text-red-400/70 uppercase'>Detalle de canción</p>
          <DialogTitle className='font-baby-doll text-2xl tracking-wider uppercase'>
            {data?.song.artist ?? '…'} — {data?.song.title ?? ''}
          </DialogTitle>
          <DialogDescription className='font-pt-mono text-xs text-white/40'>
            {data ? (
              <>
                {data.song.cassette_name} · Lado {data.song.side}
                {data.song.position}
              </>
            ) : (
              ' '
            )}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className='font-pt-mono flex items-center gap-2 py-8 text-xs text-white/40'>
            <Loader2 className='h-4 w-4 animate-spin' /> Cargando datos…
          </div>
        )}

        {error && (
          <div className='font-pt-mono py-4 text-xs text-red-300'>Error: {error}</div>
        )}

        {data && !loading && (
          <div className='space-y-6'>
            {/* ── Totals grid ─────────────────────────────────────────── */}
            <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
              <Stat
                label='Plays'
                value={data.totals.plays_total}
                tone='red'
              />
              <Stat
                label='Completes'
                value={data.totals.completes}
                tone='emerald'
              />
              <Stat
                label='Logueados'
                value={data.totals.plays_authenticated}
              />
              <Stat
                label='Anónimos'
                value={data.totals.plays_anonymous}
              />
              <Stat
                label='Únicos'
                value={data.totals.unique_listeners}
              />
              <Stat
                label='Sesiones anon'
                value={data.totals.unique_anon_sessions}
              />
              <Stat
                label='Click perfil'
                value={data.totals.profile_clicks}
                tone='blue'
              />
              <Stat
                label='Interés'
                value={data.totals.interest_clicks}
                tone='pink'
              />
            </div>

            {/* ── Listeners ───────────────────────────────────────────── */}
            <section>
              <h3 className='font-pt-mono mb-2 text-[10px] font-bold tracking-widest text-white/50 uppercase'>
                Oyentes con sesión ({data.listeners.length})
              </h3>
              {data.listeners.length === 0 ? (
                <p className='font-pt-mono rounded-md border border-dashed border-white/10 py-4 text-center text-xs text-white/30'>
                  Aún nadie logueado escuchó esta canción.
                </p>
              ) : (
                <ul className='space-y-1.5'>
                  {data.listeners.slice(0, 15).map(l => (
                    <li
                      key={l.user_id}
                      className='flex items-center gap-3 rounded-md border border-white/5 bg-white/3 px-3 py-2'
                    >
                      {l.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.photo_url}
                          alt=''
                          className='h-7 w-7 shrink-0 rounded-full object-cover'
                        />
                      ) : (
                        <span className='font-pt-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/60'>
                          {(l.display_name ?? 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                      <Link
                        href={l.slug ? `/perfil/${l.slug}` : '#'}
                        className='font-pt-mono min-w-0 flex-1 truncate text-xs font-bold text-white hover:text-red-300'
                      >
                        {l.display_name ?? 'Usuario'}
                      </Link>
                      <span className='font-pt-mono text-[10px] text-white/40'>
                        {l.completes}/{l.plays} compl.
                      </span>
                      <span className='font-pt-mono w-12 shrink-0 text-right text-xs font-bold text-red-400'>
                        {l.plays}
                      </span>
                    </li>
                  ))}
                  {data.listeners.length > 15 && (
                    <li className='font-pt-mono pt-1 text-center text-[10px] text-white/30'>
                      +{data.listeners.length - 15} oyentes más
                    </li>
                  )}
                </ul>
              )}
            </section>

            {/* ── Top anonymous sessions ──────────────────────────────── */}
            {data.top_anonymous_sessions.length > 0 && (
              <section>
                <h3 className='font-pt-mono mb-2 text-[10px] font-bold tracking-widest text-white/50 uppercase'>
                  Top sesiones anónimas
                </h3>
                <ul className='space-y-1.5'>
                  {data.top_anonymous_sessions.map(s => (
                    <li
                      key={s.session_id}
                      className='flex items-center gap-3 rounded-md border border-white/5 bg-white/3 px-3 py-2'
                    >
                      <code className='font-pt-mono min-w-0 flex-1 truncate text-[10px] text-white/40'>
                        {s.session_id}
                      </code>
                      <span className='font-pt-mono w-12 shrink-0 text-right text-xs font-bold text-blue-400'>
                        {s.plays}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Stat({
  label,
  value,
  tone = 'neutral'
}: {
  label: string
  value: number
  tone?: 'red' | 'emerald' | 'blue' | 'pink' | 'neutral'
}) {
  const tint = {
    red: 'text-red-300',
    emerald: 'text-emerald-300',
    blue: 'text-blue-300',
    pink: 'text-pink-300',
    neutral: 'text-white'
  }[tone]
  return (
    <div className='rounded-md border border-white/5 bg-white/3 px-2 py-2'>
      <p className='font-pt-mono text-[9px] tracking-widest text-white/40 uppercase'>{label}</p>
      <p className={`font-baby-doll mt-0.5 text-2xl font-bold ${tint}`}>{value.toLocaleString('es-MX')}</p>
    </div>
  )
}

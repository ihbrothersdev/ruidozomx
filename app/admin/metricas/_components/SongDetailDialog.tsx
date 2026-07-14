'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/app/components/ui/dialog'
import { Skeleton } from '@/app/components/ui/skeleton'
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
      <DialogContent className='border-admin-ink bg-admin-surface text-admin-ink admin-hard max-h-[85vh] overflow-y-auto border-2 sm:max-w-2xl'>
        <DialogHeader>
          <p className='font-pt-mono text-admin-red text-[10px] tracking-[0.25em] uppercase'>Detalle de canción</p>
          <DialogTitle className='font-baby-doll text-admin-ink text-2xl tracking-wider uppercase'>
            {data?.song.artist ?? '…'} — {data?.song.title ?? ''}
          </DialogTitle>
          <DialogDescription className='font-pt-mono text-admin-ink-soft text-xs'>
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

        {loading && <SongDetailSkeleton />}

        {error && (
          <div className='font-pt-mono text-admin-red py-4 text-xs'>Error: {error}</div>
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
              <h3 className='font-pt-mono text-admin-ink-soft mb-2 text-[10px] font-bold tracking-widest uppercase'>
                Top oyentes con sesión {data.listeners.length > 5 ? `(top 5 de ${data.listeners.length})` : `(${data.listeners.length})`}
              </h3>
              {data.listeners.length === 0 ? (
                <p className='font-pt-mono border-admin-ink/25 text-admin-ink-faint border border-dashed py-4 text-center text-xs'>
                  Aún nadie logueado escuchó esta canción.
                </p>
              ) : (
                <ul className='space-y-1.5'>
                  {data.listeners.slice(0, 5).map(l => (
                    <li
                      key={l.user_id}
                      className='border-admin-ink/15 bg-admin-surface-2 flex items-center gap-3 border px-3 py-2'
                    >
                      {l.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.photo_url}
                          alt=''
                          className='h-7 w-7 shrink-0 rounded-full object-cover'
                        />
                      ) : (
                        <span className='font-pt-mono bg-admin-ink/10 text-admin-ink-soft flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold'>
                          {(l.display_name ?? 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                      <Link
                        href={l.slug ? `/perfil/${l.slug}` : '#'}
                        className='font-pt-mono text-admin-ink hover:text-admin-red min-w-0 flex-1 truncate text-xs font-bold'
                      >
                        {l.display_name ?? 'Usuario'}
                      </Link>
                      <span className='font-pt-mono text-admin-ink-soft text-[10px]'>
                        {l.completes}/{l.plays} compl.
                      </span>
                      <span className='font-pt-mono text-admin-red w-12 shrink-0 text-right text-xs font-bold'>
                        {l.plays}
                      </span>
                    </li>
                  ))}
                  {data.listeners.length > 5 && (
                    <li className='font-pt-mono text-admin-ink-faint pt-1 text-center text-[10px]'>
                      +{data.listeners.length - 5} oyentes más
                    </li>
                  )}
                </ul>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SongDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className='border-admin-ink/15 bg-admin-surface-2 border px-2 py-2'
          >
            <Skeleton className='bg-admin-ink/10 h-2.5 w-12' />
            <Skeleton className='bg-admin-ink/10 mt-2 h-6 w-10' />
          </div>
        ))}
      </div>
      <section>
        <Skeleton className='bg-admin-ink/10 mb-2 h-2.5 w-44' />
        <ul className='space-y-1.5'>
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className='border-admin-ink/15 bg-admin-surface-2 flex items-center gap-3 border px-3 py-2'
            >
              <Skeleton className='bg-admin-ink/10 h-7 w-7 shrink-0 rounded-full' />
              <Skeleton className='bg-admin-ink/10 h-3 flex-1' />
              <Skeleton className='bg-admin-ink/10 h-3 w-12 shrink-0' />
            </li>
          ))}
        </ul>
      </section>
    </div>
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
    red: 'text-admin-red',
    emerald: 'text-admin-olive',
    blue: 'text-admin-blue',
    pink: 'text-admin-magenta',
    neutral: 'text-admin-ink'
  }[tone]
  return (
    <div className='border-admin-ink/15 bg-admin-surface-2 border px-2 py-2'>
      <p className='font-pt-mono text-admin-ink-soft text-[9px] tracking-widest uppercase'>{label}</p>
      <p className={`font-baby-doll mt-0.5 text-2xl font-bold ${tint}`}>{value.toLocaleString('es-MX')}</p>
    </div>
  )
}

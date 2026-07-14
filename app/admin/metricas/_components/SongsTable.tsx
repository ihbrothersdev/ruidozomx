'use client'

import { Input } from '@/app/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AdminButton } from '../../_components/kit'
import type { SinceWindow, SongMetricRow } from '../_lib/aggregations'
import { SongDetailDialog } from './SongDetailDialog'

export type { SongMetricRow }

type SortKey =
  | 'artist'
  | 'cassette'
  | 'plays_total'
  | 'plays_authenticated'
  | 'unique_listeners'
  | 'completion_rate'
  | 'profile_clicks'
  | 'interest_clicks'

type SideFilter = 'all' | 'A' | 'B'

const PAGE_SIZE = 10

export function SongsTable({ rows, since }: { rows: SongMetricRow[]; since: SinceWindow }) {
  const [search, setSearch] = useState('')
  const [side, setSide] = useState<SideFilter>('all')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'plays_total', dir: 'desc' })
  const [page, setPage] = useState(0)
  const [detailSongId, setDetailSongId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let out = rows
    if (side !== 'all') out = out.filter(r => r.side === side)
    if (q) {
      out = out.filter(
        r =>
          r.artist.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.cassette_name.toLowerCase().includes(q)
      )
    }
    const dir = sort.dir === 'asc' ? 1 : -1
    out = [...out].sort((a, b) => {
      const va = getSortValue(a, sort.key)
      const vb = getSortValue(b, sort.key)
      if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir
      return (Number(va) - Number(vb)) * dir
    })
    return out
  }, [rows, search, side, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function toggleSort(key: SortKey) {
    setSort(prev => (prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }))
    setPage(0)
  }

  function exportCsv() {
    const headers = [
      'lado',
      'pos',
      'artista',
      'titulo',
      'cassette',
      'plays_total',
      'plays_logueados',
      'oyentes_unicos',
      'sesiones_anon',
      'completes',
      'completion_rate',
      'profile_clicks',
      'interest_clicks',
      'share_clicks'
    ]
    const lines = [headers.join(',')]
    for (const r of filtered) {
      lines.push(
        [
          r.side,
          r.track_position,
          csv(r.artist),
          csv(r.title),
          csv(r.cassette_name),
          r.plays_total,
          r.plays_authenticated,
          r.unique_listeners,
          r.unique_anon_sessions,
          r.completes,
          r.completion_rate,
          r.profile_clicks,
          r.interest_clicks,
          r.share_clicks
        ].join(',')
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-songs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='admin-card space-y-3 overflow-hidden p-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative min-w-[220px] flex-1'>
          <Search className='text-admin-ink-faint pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2' />
          <Input
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder='Buscar artista, título o cassette…'
            className='font-pt-mono border-admin-ink bg-admin-paper text-admin-ink placeholder:text-admin-ink-faint h-8 border-2 pl-9 text-xs'
          />
        </div>

        <div className='flex items-center gap-1'>
          {(['all', 'A', 'B'] as const).map(s => (
            <button
              key={s}
              type='button'
              onClick={() => {
                setSide(s)
                setPage(0)
              }}
              className={`font-pt-mono border-admin-ink cursor-pointer border-2 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-colors ${
                side === s
                  ? 'bg-admin-red text-admin-surface admin-hard-sm'
                  : 'bg-admin-surface text-admin-ink hover:bg-admin-paper-deep'
              }`}
            >
              {s === 'all' ? 'A+B' : `Lado ${s}`}
            </button>
          ))}
        </div>

        <AdminButton
          type='button'
          variant='ghost'
          size='sm'
          onClick={exportCsv}
          disabled={filtered.length === 0}
        >
          <Download className='h-3 w-3' />
          CSV ({filtered.length})
        </AdminButton>
      </div>

      <div className='-mx-3 overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='border-admin-ink hover:bg-admin-paper-deep bg-admin-paper-deep border-b-2'>
                <SortableTh
                  active={sort.key === 'artist'}
                  dir={sort.dir}
                  onClick={() => toggleSort('artist')}
                >
                  Canción
                </SortableTh>
                <SortableTh
                  active={sort.key === 'cassette'}
                  dir={sort.dir}
                  onClick={() => toggleSort('cassette')}
                >
                  Cassette
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'plays_total'}
                  dir={sort.dir}
                  onClick={() => toggleSort('plays_total')}
                >
                  Plays
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'plays_authenticated'}
                  dir={sort.dir}
                  onClick={() => toggleSort('plays_authenticated')}
                >
                  Logueados
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'unique_listeners'}
                  dir={sort.dir}
                  onClick={() => toggleSort('unique_listeners')}
                >
                  Únicos
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'completion_rate'}
                  dir={sort.dir}
                  onClick={() => toggleSort('completion_rate')}
                >
                  Compl.
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'profile_clicks'}
                  dir={sort.dir}
                  onClick={() => toggleSort('profile_clicks')}
                >
                  Perfil
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'interest_clicks'}
                  dir={sort.dir}
                  onClick={() => toggleSort('interest_clicks')}
                >
                  Interés
                </SortableTh>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className='font-pt-mono text-admin-ink-faint py-8 text-center text-xs'
                  >
                    Sin coincidencias.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map(s => (
                  <TableRow
                    key={s.song_id}
                    onClick={() => setDetailSongId(s.song_id)}
                    className='border-admin-ink/15 hover:bg-admin-surface-2/60 cursor-pointer border-b'
                  >
                    <Td>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`border-admin-ink inline-flex h-5 w-5 items-center justify-center border text-[10px] font-bold ${
                            s.side === 'A' ? 'bg-admin-red text-admin-surface' : 'bg-admin-blue text-admin-surface'
                          }`}
                        >
                          {s.side}
                        </span>
                        <span className='font-pt-mono text-admin-ink-soft border-admin-ink/15 border px-1 text-[9px] tracking-widest uppercase'>
                          #{s.track_position}
                        </span>
                        <div className='min-w-0'>
                          <p className='text-admin-ink truncate font-bold'>{s.artist}</p>
                          <p className='text-admin-ink-faint truncate text-[10px]'>{s.title}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/cassettes/${s.cassette_id}`}
                        onClick={e => e.stopPropagation()}
                        className='text-admin-ink-soft hover:text-admin-ink inline-flex items-center gap-1'
                      >
                        {s.cassette_name}
                        <ExternalLink className='h-3 w-3' />
                      </Link>
                    </Td>
                    <Td
                      align='right'
                      bold
                    >
                      {s.plays_total.toLocaleString('es-MX')}
                    </Td>
                    <Td align='right'>{s.plays_authenticated.toLocaleString('es-MX')}</Td>
                    <Td align='right'>{s.unique_listeners.toLocaleString('es-MX')}</Td>
                    <Td align='right'>
                      {Number(s.completion_rate)}%<span className='text-admin-ink-faint ml-1'>({s.completes})</span>
                    </Td>
                    <Td align='right'>{s.profile_clicks.toLocaleString('es-MX')}</Td>
                    <Td align='right'>{s.interest_clicks.toLocaleString('es-MX')}</Td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className='border-admin-ink/15 flex items-center justify-between border-t pt-2'>
            <span className='font-pt-mono text-admin-ink-faint text-[10px] tracking-widest uppercase'>
              {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div className='flex items-center gap-1'>
              <PagerButton
                disabled={safePage === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                <ChevronLeft className='h-3.5 w-3.5' />
              </PagerButton>
              <span className='font-pt-mono text-admin-ink-soft px-1 text-[10px] tracking-widest uppercase'>
                {safePage + 1}/{totalPages}
              </span>
              <PagerButton
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className='h-3.5 w-3.5' />
              </PagerButton>
            </div>
          </div>
        )}

      <SongDetailDialog
        songId={detailSongId}
        since={since}
        open={detailSongId !== null}
        onOpenChange={open => {
          if (!open) setDetailSongId(null)
        }}
      />
    </div>
  )
}

function SortableTh({
  children,
  align,
  active,
  dir,
  onClick
}: {
  children: React.ReactNode
  align?: 'right'
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
}) {
  const Icon = !active ? ArrowUpDown : dir === 'desc' ? ArrowDown : ArrowUp
  return (
    <TableHead
      className={`font-pt-mono hover:bg-admin-paper-deep cursor-pointer px-4 py-2 text-[10px] font-bold tracking-[0.18em] uppercase select-none ${
        active ? 'text-admin-red' : 'text-admin-ink'
      } ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={onClick}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {children}
        <Icon className='h-3 w-3 opacity-60' />
      </span>
    </TableHead>
  )
}

function Td({ children, align, bold }: { children: React.ReactNode; align?: 'right'; bold?: boolean }) {
  return (
    <TableCell
      className={`font-pt-mono text-admin-ink text-xs ${align === 'right' ? 'text-right tabular-nums' : 'text-left'} ${
        bold ? 'font-bold' : ''
      }`}
    >
      {children}
    </TableCell>
  )
}

function PagerButton({
  children,
  disabled,
  onClick
}: {
  children: React.ReactNode
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className='border-admin-ink bg-admin-surface text-admin-ink hover:bg-admin-paper-deep flex h-7 w-7 cursor-pointer items-center justify-center border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30'
    >
      {children}
    </button>
  )
}

function csv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function getSortValue(row: SongMetricRow, key: SortKey): string | number {
  switch (key) {
    case 'artist':
      return row.artist.toLowerCase()
    case 'cassette':
      return row.cassette_name.toLowerCase()
    default:
      return Number(row[key] ?? 0)
  }
}

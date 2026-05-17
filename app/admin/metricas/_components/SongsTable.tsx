'use client'

import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { ArrowDown, ArrowUp, ArrowUpDown, Download, ExternalLink, Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
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

const PAGE_SIZE = 30

export function SongsTable({ rows, since }: { rows: SongMetricRow[]; since: SinceWindow }) {
  const [search, setSearch] = useState('')
  const [side, setSide] = useState<SideFilter>('all')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'plays_total', dir: 'desc' })
  const [showAll, setShowAll] = useState(false)
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

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE)

  function toggleSort(key: SortKey) {
    setSort(prev => (prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }))
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
    <Card className='gap-0 overflow-hidden border-white/10 bg-white/2 py-0'>
      <CardContent className='space-y-3 p-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative min-w-[220px] flex-1'>
            <Search className='pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/30' />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Buscar artista, título o cassette…'
              className='font-pt-mono h-8 border-white/10 bg-white/3 pl-9 text-xs text-white placeholder:text-white/30'
            />
          </div>

          <div className='flex items-center gap-1 rounded-md border border-white/10 bg-white/3 p-0.5'>
            {(['all', 'A', 'B'] as const).map(s => (
              <button
                key={s}
                type='button'
                onClick={() => setSide(s)}
                className={`font-pt-mono cursor-pointer rounded px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                  side === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {s === 'all' ? 'A+B' : `Lado ${s}`}
              </button>
            ))}
          </div>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className='font-pt-mono h-8 text-[10px] tracking-widest text-white/60 uppercase hover:bg-white/5 hover:text-white'
          >
            <Download className='h-3 w-3' />
            CSV ({filtered.length})
          </Button>
        </div>

        <div className='-mx-3 overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='border-white/5 bg-white/3 hover:bg-white/3'>
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
                    className='font-pt-mono py-8 text-center text-xs text-white/30'
                  >
                    Sin coincidencias.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map(s => (
                  <TableRow
                    key={s.song_id}
                    onClick={() => setDetailSongId(s.song_id)}
                    className='cursor-pointer border-white/5 hover:bg-white/5'
                  >
                    <Td>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                            s.side === 'A' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {s.side}
                        </span>
                        <Badge
                          variant='secondary'
                          className='font-pt-mono bg-white/5 text-[9px] tracking-widest text-white/40 uppercase'
                        >
                          #{s.track_position}
                        </Badge>
                        <div className='min-w-0'>
                          <p className='truncate font-bold text-white'>{s.artist}</p>
                          <p className='truncate text-[10px] text-white/40'>{s.title}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/cassettes/${s.cassette_id}`}
                        onClick={e => e.stopPropagation()}
                        className='inline-flex items-center gap-1 text-white/60 hover:text-white'
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
                      {Number(s.completion_rate)}%<span className='ml-1 text-white/30'>({s.completes})</span>
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
          <button
            type='button'
            onClick={() => setShowAll(v => !v)}
            className='font-pt-mono w-full cursor-pointer border-t border-white/5 py-2 text-center text-[10px] tracking-widest text-white/40 uppercase hover:bg-white/3 hover:text-white'
          >
            {showAll ? `Mostrar solo ${PAGE_SIZE}` : `Ver las ${filtered.length} canciones`}
          </button>
        )}
      </CardContent>

      <SongDetailDialog
        songId={detailSongId}
        since={since}
        open={detailSongId !== null}
        onOpenChange={open => {
          if (!open) setDetailSongId(null)
        }}
      />
    </Card>
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
      className={`font-pt-mono cursor-pointer text-[10px] tracking-widest uppercase select-none hover:bg-white/3 ${
        active ? 'text-white' : 'text-white/50'
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
      className={`font-pt-mono text-xs text-white/80 ${align === 'right' ? 'text-right' : 'text-left'} ${
        bold ? 'font-bold text-white' : ''
      }`}
    >
      {children}
    </TableCell>
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

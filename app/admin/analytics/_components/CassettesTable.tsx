'use client'

import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export type CassetteMetricRow = {
  cassette_id: string
  cassette_name: string
  active: boolean
  archived: boolean
  is_next: boolean
  sessions_started: number
  sessions_finished: number
  unique_session_users: number
  unique_anon_sessions: number
  total_plays: number
  total_completes: number
}

type SortKey =
  | 'cassette_name'
  | 'sessions_started'
  | 'sessions_finished'
  | 'unique_session_users'
  | 'unique_anon_sessions'
  | 'total_plays'
  | 'total_completes'

export function CassettesTable({ rows }: { rows: CassetteMetricRow[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'sessions_started', dir: 'desc' })

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const va = sort.key === 'cassette_name' ? a.cassette_name.toLowerCase() : Number(a[sort.key] ?? 0)
      const vb = sort.key === 'cassette_name' ? b.cassette_name.toLowerCase() : Number(b[sort.key] ?? 0)
      if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir
      return (Number(va) - Number(vb)) * dir
    })
  }, [rows, sort])

  function toggleSort(key: SortKey) {
    setSort(prev => (prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }))
  }

  function exportCsv() {
    const headers = [
      'cassette',
      'estado',
      'sesiones_iniciadas',
      'sesiones_finalizadas',
      'usuarios_logueados',
      'sesiones_anon',
      'plays_totales',
      'completes_totales'
    ]
    const lines = [headers.join(',')]
    for (const c of sorted) {
      const state = c.active ? 'activo' : c.is_next ? 'siguiente' : c.archived ? 'archivado' : 'borrador'
      lines.push(
        [
          csv(c.cassette_name),
          state,
          c.sessions_started,
          c.sessions_finished,
          c.unique_session_users,
          c.unique_anon_sessions,
          c.total_plays,
          c.total_completes
        ].join(',')
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-cassettes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className='gap-0 overflow-hidden border-white/10 bg-white/2 py-0'>
      <CardContent className='space-y-3 p-3'>
        <div className='flex items-center justify-end'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={exportCsv}
            disabled={rows.length === 0}
            className='font-pt-mono h-8 text-[10px] tracking-widest text-white/60 uppercase hover:bg-white/5 hover:text-white'
          >
            <Download className='h-3 w-3' />
            CSV ({rows.length})
          </Button>
        </div>

        <div className='-mx-3 overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='border-white/5 bg-white/3 hover:bg-white/3'>
                <SortableTh
                  active={sort.key === 'cassette_name'}
                  dir={sort.dir}
                  onClick={() => toggleSort('cassette_name')}
                >
                  Cassette
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'sessions_started'}
                  dir={sort.dir}
                  onClick={() => toggleSort('sessions_started')}
                >
                  Sesiones
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'sessions_finished'}
                  dir={sort.dir}
                  onClick={() => toggleSort('sessions_finished')}
                >
                  Finalizadas
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'unique_session_users'}
                  dir={sort.dir}
                  onClick={() => toggleSort('unique_session_users')}
                >
                  Logueados
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'unique_anon_sessions'}
                  dir={sort.dir}
                  onClick={() => toggleSort('unique_anon_sessions')}
                >
                  Anónimos
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'total_plays'}
                  dir={sort.dir}
                  onClick={() => toggleSort('total_plays')}
                >
                  Plays
                </SortableTh>
                <SortableTh
                  align='right'
                  active={sort.key === 'total_completes'}
                  dir={sort.dir}
                  onClick={() => toggleSort('total_completes')}
                >
                  Completes
                </SortableTh>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='font-pt-mono py-8 text-center text-xs text-white/30'
                  >
                    No hay cassettes registrados.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map(c => (
                  <TableRow
                    key={c.cassette_id}
                    className='border-white/5 hover:bg-white/2'
                  >
                    <Td>
                      <Link
                        href={`/admin/cassettes/${c.cassette_id}`}
                        className='font-pt-mono inline-flex items-center gap-2 text-xs font-bold text-white hover:text-red-300'
                      >
                        {c.cassette_name}
                        {c.active && <StateBadge color='red'>Activo</StateBadge>}
                        {c.is_next && <StateBadge color='amber'>Siguiente</StateBadge>}
                        {c.archived && <StateBadge color='neutral'>Archivado</StateBadge>}
                      </Link>
                    </Td>
                    <Td
                      align='right'
                      bold
                    >
                      {c.sessions_started.toLocaleString('es-MX')}
                    </Td>
                    <Td align='right'>{c.sessions_finished.toLocaleString('es-MX')}</Td>
                    <Td align='right'>{c.unique_session_users.toLocaleString('es-MX')}</Td>
                    <Td align='right'>{c.unique_anon_sessions.toLocaleString('es-MX')}</Td>
                    <Td align='right'>{c.total_plays.toLocaleString('es-MX')}</Td>
                    <Td align='right'>{c.total_completes.toLocaleString('es-MX')}</Td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
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

function StateBadge({ children, color }: { children: React.ReactNode; color: 'red' | 'amber' | 'neutral' }) {
  const cls = {
    red: 'bg-red-500/20 text-red-300',
    amber: 'bg-amber-500/20 text-amber-300',
    neutral: 'bg-white/10 text-white/50'
  }[color]
  return (
    <Badge
      variant='secondary'
      className={`font-pt-mono ml-2 text-[9px] font-bold tracking-widest uppercase ${cls}`}
    >
      {children}
    </Badge>
  )
}

function csv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

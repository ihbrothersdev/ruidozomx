'use client'

import { setPortfolioQuoteStatus } from '@/app/admin/actions'
import { Check, ChevronLeft, ChevronRight, Mail, Palette, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AdminButton, EmptyState, Paper, Stamp } from '../../_components/kit'

export interface QuoteItem {
  id: string
  name: string
  email: string | null
  slug: string | null
  servicios: string[]
  message: string | null
  status: 'pending' | 'attended'
  created_at: string
}

export type StatusFilter = 'all' | 'pending' | 'attended'

const PAGE_SIZE = 10

const fmtDate = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Mexico_City'
})

export function CotizacionesList({ quotes, initialFilter }: { quotes: QuoteItem[]; initialFilter: StatusFilter }) {
  const [filter, setFilterState] = useState<StatusFilter>(initialFilter)
  const [page, setPage] = useState(0)

  const pendingCount = quotes.filter(q => q.status === 'pending').length
  const attendedCount = quotes.length - pendingCount
  const filtered = quotes.filter(q => (filter === 'all' ? true : q.status === filter))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function setFilter(next: StatusFilter) {
    setFilterState(next)
    setPage(0)
  }

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <FilterTab
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          Todas ({quotes.length})
        </FilterTab>
        <FilterTab
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({pendingCount})
        </FilterTab>
        <FilterTab
          active={filter === 'attended'}
          onClick={() => setFilter('attended')}
        >
          Atendidas ({attendedCount})
        </FilterTab>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Palette}>Nada por acá. Cuando una banda pida imagen o diseño, cae aquí.</EmptyState>
      ) : (
        <>
          <ul className='space-y-2'>
            {visible.map(q => (
              <QuoteCard
                key={q.id}
                quote={q}
                filter={filter}
              />
            ))}
          </ul>

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
        </>
      )}
    </div>
  )
}

function QuoteCard({ quote: q, filter }: { quote: QuoteItem; filter: StatusFilter }) {
  const [expanded, setExpanded] = useState(false)
  const isAttended = q.status === 'attended'
  const long = (q.message?.length ?? 0) > 180

  return (
    <li>
      <Paper
        tone={isAttended ? undefined : 'red'}
        className={`space-y-3 p-4 ${isAttended ? 'opacity-70' : ''}`}
      >
        <div className='flex flex-wrap items-start justify-between gap-x-4 gap-y-2'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              {q.slug ? (
                <Link
                  href={`/perfil/${q.slug}`}
                  className='text-admin-ink hover:text-admin-red truncate font-bold'
                >
                  {q.name}
                </Link>
              ) : (
                <span className='text-admin-ink truncate font-bold'>{q.name}</span>
              )}
              {isAttended ? <Stamp tone='olive'>Atendida</Stamp> : <Stamp tone='red'>Pendiente</Stamp>}
            </div>
            {q.email ? (
              <a
                href={`mailto:${q.email}`}
                className='font-pt-mono text-admin-ink-soft hover:text-admin-red mt-1 flex items-center gap-1 text-[11px]'
              >
                <Mail className='h-3 w-3 shrink-0' />
                <span className='truncate'>{q.email}</span>
              </a>
            ) : (
              <p className='font-pt-mono text-admin-ink-faint mt-1 text-[11px]'>Sin correo de contacto</p>
            )}
          </div>
          <span className='font-pt-mono text-admin-ink-faint shrink-0 text-[10px] tracking-widest uppercase'>
            {fmtDate.format(new Date(q.created_at))}
          </span>
        </div>

        {q.servicios.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {q.servicios.map(s => (
              <span
                key={s}
                className='font-pt-mono border-admin-ink/15 bg-admin-surface-2 text-admin-ink-soft rounded border px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase'
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {q.message && (
          <div>
            <p
              className={`font-pt-mono text-admin-ink-soft text-[12px] leading-relaxed whitespace-pre-wrap ${!expanded && long ? 'line-clamp-3' : ''}`}
            >
              {q.message}
            </p>
            {long && (
              <button
                type='button'
                onClick={() => setExpanded(e => !e)}
                className='font-pt-mono text-admin-red mt-1 cursor-pointer text-[10px] tracking-widest uppercase'
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        )}

        <form
          action={setPortfolioQuoteStatus}
          className='flex justify-end'
        >
          <input
            type='hidden'
            name='quote_id'
            value={q.id}
          />
          <input
            type='hidden'
            name='next'
            value={isAttended ? 'pending' : 'attended'}
          />
          <input
            type='hidden'
            name='f'
            value={filter}
          />
          {isAttended ? (
            <AdminButton
              type='submit'
              variant='ghost'
              size='sm'
            >
              <RotateCcw className='h-3 w-3' />
              Reabrir
            </AdminButton>
          ) : (
            <AdminButton
              type='submit'
              size='sm'
              className='bg-admin-olive text-admin-surface'
            >
              <Check className='h-3.5 w-3.5' />
              Marcar atendida
            </AdminButton>
          )}
        </form>
      </Paper>
    </li>
  )
}

function FilterTab({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`font-pt-mono border-admin-ink cursor-pointer border-2 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors ${
        active
          ? 'bg-admin-red text-admin-surface admin-hard-sm'
          : 'bg-admin-surface text-admin-ink hover:bg-admin-paper-deep'
      }`}
    >
      {children}
    </button>
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
      className='border-admin-ink bg-admin-surface text-admin-ink hover:bg-admin-paper-deep disabled:hover:bg-admin-surface flex h-7 w-7 cursor-pointer items-center justify-center border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30'
    >
      {children}
    </button>
  )
}

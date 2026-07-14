'use client'

import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EmptyState, Paper, Stamp } from '../../_components/kit'

export interface EventItem {
  id: string
  title: string
  event_date: string
  venue_name: string | null
  city: string | null
  event_type: string | null
  external_link: string | null
  status: 'published' | 'cancelled'
  organizer: { name: string; slug: string | null }
}

const PAGE_SIZE = 10

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

type TimeFilter = 'all' | 'upcoming' | 'past'

export function EventsList({ events, todayIso }: { events: EventItem[]; todayIso: string }) {
  const [filter, setFilterState] = useState<TimeFilter>('all')
  const [page, setPage] = useState(0)

  const upcomingCount = events.filter(e => e.event_date >= todayIso).length
  const pastCount = events.length - upcomingCount
  const filtered = events.filter(e =>
    filter === 'upcoming' ? e.event_date >= todayIso : filter === 'past' ? e.event_date < todayIso : true
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function setFilter(next: TimeFilter) {
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
          Todos ({events.length})
        </FilterTab>
        <FilterTab
          active={filter === 'upcoming'}
          onClick={() => setFilter('upcoming')}
        >
          Próximos ({upcomingCount})
        </FilterTab>
        <FilterTab
          active={filter === 'past'}
          onClick={() => setFilter('past')}
        >
          Vencidos ({pastCount})
        </FilterTab>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarDays}>La agenda está vacía. Nada que sonar por acá.</EmptyState>
      ) : (
        <>
          <ul className='space-y-2'>
            {visible.map(e => (
              <EventCard
                key={e.id}
                event={e}
                isPast={e.event_date < todayIso}
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

function EventCard({ event: e, isPast }: { event: EventItem; isPast: boolean }) {
  const url = e.external_link && /^https?:\/\//.test(e.external_link) ? e.external_link : null
  const place = [e.venue_name, e.city].filter(Boolean).join(' · ')
  return (
    <li>
      <Paper
        tone={e.status === 'cancelled' ? 'red' : undefined}
        className={`flex flex-wrap items-center gap-x-4 gap-y-2 p-4 ${isPast ? 'opacity-60' : ''}`}
      >
        <div className='flex w-14 shrink-0 flex-col items-center'>
          <CalendarDays className='text-admin-ink-faint h-4 w-4' />
          <span className='font-pt-mono text-admin-ink-soft mt-1 text-center text-[10px] leading-tight tracking-widest uppercase'>
            {fmtDate(e.event_date)}
          </span>
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='text-admin-ink truncate font-bold'>{e.title}</p>
            {e.event_type ? (
              <span className='font-pt-mono border-admin-ink/15 bg-admin-surface-2 text-admin-ink-soft rounded border px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase'>
                {e.event_type}
              </span>
            ) : null}
            {e.status === 'cancelled' ? <Stamp tone='ink'>Cancelado</Stamp> : null}
            {isPast ? (
              <span className='font-pt-mono text-admin-ink-faint text-[9px] tracking-widest uppercase'>Pasado</span>
            ) : null}
          </div>
          {place ? (
            <p className='font-pt-mono text-admin-ink-soft mt-1 flex items-center gap-1 text-[11px]'>
              <MapPin className='h-3 w-3 shrink-0' />
              <span className='truncate'>{place}</span>
            </p>
          ) : null}
          <p className='font-pt-mono text-admin-ink-soft mt-1 text-[11px]'>
            por{' '}
            <Link
              href={e.organizer.slug ? `/perfil/${e.organizer.slug}` : '#'}
              className='text-admin-ink hover:text-admin-red font-bold'
            >
              {e.organizer.name}
            </Link>
          </p>
        </div>

        {url ? (
          <Link
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='font-pt-mono border-admin-ink bg-admin-surface text-admin-ink hover:bg-admin-paper-deep flex shrink-0 items-center gap-1 border-2 px-2.5 py-1 text-[10px] tracking-widest uppercase transition-colors'
          >
            Link
            <ExternalLink className='h-3 w-3' />
          </Link>
        ) : null}
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

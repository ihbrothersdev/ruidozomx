'use client'

import { Card, CardContent } from '@/app/components/ui/card'
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

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
      <div className='flex items-center gap-1 self-start rounded-md border border-white/10 bg-white/3 p-0.5'>
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
        <Card className='border-dashed border-white/10 bg-transparent py-12'>
          <CardContent className='font-pt-mono text-center text-xs text-white/30'>
            No hay eventos para mostrar.
          </CardContent>
        </Card>
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
            <div className='flex items-center justify-between border-t border-white/5 pt-2'>
              <span className='font-pt-mono text-[10px] tracking-widest text-white/30 uppercase'>
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className='flex items-center gap-1'>
                <PagerButton
                  disabled={safePage === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  <ChevronLeft className='h-3.5 w-3.5' />
                </PagerButton>
                <span className='font-pt-mono px-1 text-[10px] tracking-widest text-white/40 uppercase'>
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
    <Card className={`gap-0 border-white/10 bg-white/3 py-0 ${isPast ? 'opacity-60' : ''}`}>
      <CardContent className='flex flex-wrap items-center gap-x-4 gap-y-2 p-4'>
        <div className='flex w-14 shrink-0 flex-col items-center'>
          <CalendarDays className='h-4 w-4 text-white/30' />
          <span className='font-pt-mono mt-1 text-center text-[10px] leading-tight tracking-widest text-white/50 uppercase'>
            {fmtDate(e.event_date)}
          </span>
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='truncate font-bold text-white'>{e.title}</p>
            {e.event_type ? (
              <span className='font-pt-mono rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold tracking-widest text-white/50 uppercase'>
                {e.event_type}
              </span>
            ) : null}
            {e.status === 'cancelled' ? (
              <span className='font-pt-mono rounded bg-red-500/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-red-300 uppercase'>
                Cancelado
              </span>
            ) : null}
            {isPast ? (
              <span className='font-pt-mono text-[9px] tracking-widest text-white/30 uppercase'>Pasado</span>
            ) : null}
          </div>
          {place ? (
            <p className='font-pt-mono mt-1 flex items-center gap-1 text-[11px] text-white/40'>
              <MapPin className='h-3 w-3 shrink-0' />
              <span className='truncate'>{place}</span>
            </p>
          ) : null}
          <p className='font-pt-mono mt-1 text-[11px] text-white/40'>
            por{' '}
            <Link
              href={e.organizer.slug ? `/perfil/${e.organizer.slug}` : '#'}
              className='font-bold text-white/70 hover:text-red-300'
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
            className='font-pt-mono flex shrink-0 items-center gap-1 rounded border border-white/10 bg-white/3 px-2.5 py-1 text-[10px] tracking-widest text-white/60 uppercase transition-colors hover:bg-white/8 hover:text-white'
          >
            Link
            <ExternalLink className='h-3 w-3' />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}

function FilterTab({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`font-pt-mono cursor-pointer rounded px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors ${
        active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
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
      className='flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-white/10 bg-white/3 text-white/60 transition-colors hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/3'
    >
      {children}
    </button>
  )
}

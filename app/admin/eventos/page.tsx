import { Card, CardContent } from '@/app/components/ui/card'
import { createServiceClient } from '@/lib/supabase/service'
import { CalendarDays, ExternalLink, MapPin } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Eventos · Admin · Ruidozo MX'
}

type EventStatus = 'published' | 'cancelled'

interface EventRow {
  id: string
  title: string
  event_date: string
  event_end_date: string | null
  venue_name: string | null
  city: string | null
  state: string | null
  event_type: string | null
  external_link: string | null
  status: EventStatus
  organizer: { display_name: string | null; slug: string | null } | null
}

function pickOrganizer(raw: unknown): { name: string; slug: string | null } {
  const row = (Array.isArray(raw) ? raw[0] : raw) as { display_name?: string | null; slug?: string | null } | null
  return { name: row?.display_name ?? 'Sin organizador', slug: row?.slug ?? null }
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function EventosPage() {
  const svc = createServiceClient()

  const { data } = await svc
    .from('events')
    .select(
      'id, title, event_date, event_end_date, venue_name, city, state, event_type, external_link, status, organizer:profiles!events_profile_id_fkey(display_name, slug)'
    )
    .order('event_date', { ascending: false })

  const events = (data ?? []) as unknown as EventRow[]
  const todayIso = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local
  const publishedCount = events.filter(e => e.status === 'published').length
  const cancelledCount = events.length - publishedCount

  return (
    <div className='mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-8 sm:py-12'>
      <header>
        <p className='font-pt-mono text-xs tracking-[0.3em] text-red-400/70 uppercase'>Agenda</p>
        <h1 className='font-baby-doll mt-1 text-4xl font-bold tracking-wider text-white uppercase sm:text-5xl'>
          Eventos
        </h1>
        <p className='font-pt-mono mt-2 max-w-2xl text-sm text-white/40'>
          Tocadas, convocatorias y fechas que publican las bandas. Solo lectura.
        </p>
        <p className='font-pt-mono mt-2 text-[11px] tracking-widest text-white/30 uppercase'>
          {publishedCount} publicados
          {cancelledCount > 0 ? ` · ${cancelledCount} cancelados` : ''}
        </p>
      </header>

      {events.length === 0 ? (
        <Card className='border-dashed border-white/10 bg-transparent py-12'>
          <CardContent className='font-pt-mono text-center text-xs text-white/30'>
            Aún no hay eventos publicados.
          </CardContent>
        </Card>
      ) : (
        <ul className='space-y-2'>
          {events.map(e => {
            const organizer = pickOrganizer(e.organizer)
            const isPast = e.event_date < todayIso
            const url = e.external_link && /^https?:\/\//.test(e.external_link) ? e.external_link : null
            const place = [e.venue_name, e.city].filter(Boolean).join(' · ')
            return (
              <Card
                key={e.id}
                className={`gap-0 border-white/10 bg-white/3 py-0 ${isPast ? 'opacity-60' : ''}`}
              >
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
                        href={organizer.slug ? `/perfil/${organizer.slug}` : '#'}
                        className='font-bold text-white/70 hover:text-red-300'
                      >
                        {organizer.name}
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
          })}
        </ul>
      )}
    </div>
  )
}

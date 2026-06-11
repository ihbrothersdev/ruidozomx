import { createServiceClient } from '@/lib/supabase/service'
import { EventsList, type EventItem } from './_components/EventsList'

export const metadata = {
  title: 'Eventos · Admin · Ruidozo MX'
}

function pickOrganizer(raw: unknown): { name: string; slug: string | null } {
  const row = (Array.isArray(raw) ? raw[0] : raw) as { display_name?: string | null; slug?: string | null } | null
  return { name: row?.display_name ?? 'Sin organizador', slug: row?.slug ?? null }
}

export default async function EventosPage() {
  const svc = createServiceClient()

  const { data } = await svc
    .from('events')
    .select(
      'id, title, event_date, venue_name, city, event_type, external_link, status, organizer:profiles!events_profile_id_fkey(display_name, slug)'
    )
    .order('event_date', { ascending: false })

  const events: EventItem[] = (data ?? []).map(e => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date,
    venue_name: e.venue_name,
    city: e.city,
    event_type: e.event_type,
    external_link: e.external_link,
    status: e.status as 'published' | 'cancelled',
    organizer: pickOrganizer(e.organizer)
  }))

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

      <EventsList
        events={events}
        todayIso={todayIso}
      />
    </div>
  )
}

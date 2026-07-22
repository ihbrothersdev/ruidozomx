import { createServiceClient } from '@/lib/supabase/service'
import { CheckCircle2, Inbox, Palette } from 'lucide-react'
import { LabelTag, PageHeader, StatCard } from '../_components/kit'
import { CotizacionesList, type QuoteItem, type StatusFilter } from './_components/CotizacionesList'

export const metadata = {
  title: 'Cotizaciones · Admin · Ruidozo MX'
}

function parseFilter(raw: string | undefined): StatusFilter {
  return raw === 'pending' || raw === 'attended' ? raw : 'all'
}

export default async function CotizacionesPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const sp = await searchParams
  const initialFilter = parseFilter(sp.f)

  const svc = createServiceClient()
  const { data } = await svc
    .from('portfolio_quotes')
    .select('id, profile_id, requester_name, requester_email, servicios, message, status, created_at')
    .order('created_at', { ascending: false })

  const rows = data ?? []

  // Link each request back to its profile (may be null if the account was
  // deleted); the snapshot name/email on the row is the fallback.
  const requesters: Record<string, { display_name: string | null; slug: string | null }> = {}
  const profileIds = [...new Set(rows.map(r => r.profile_id).filter((id): id is string => !!id))]
  if (profileIds.length > 0) {
    const { data: profiles } = await svc.from('profiles').select('id, display_name, slug').in('id', profileIds)
    for (const p of profiles ?? []) requesters[p.id] = { display_name: p.display_name, slug: p.slug }
  }

  const quotes: QuoteItem[] = rows.map(r => {
    const prof = r.profile_id ? requesters[r.profile_id] : null
    return {
      id: r.id,
      name: r.requester_name ?? prof?.display_name ?? 'Sin nombre',
      email: r.requester_email ?? null,
      slug: prof?.slug ?? null,
      servicios: (r.servicios ?? []) as string[],
      message: r.message,
      status: r.status === 'attended' ? 'attended' : 'pending',
      created_at: r.created_at
    }
  })

  const pendingCount = quotes.filter(q => q.status === 'pending').length
  const attendedCount = quotes.length - pendingCount

  return (
    <div className='mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-8 sm:py-12'>
      <PageHeader
        eyebrow='Portafolio'
        title='Cotizaciones'
        description='Solicitudes de imagen y diseño que mandan las bandas desde su perfil (“¿Tu proyecto necesita imagen?”). Contáctalas por correo y marca cada una como atendida.'
        action={<LabelTag tone={pendingCount > 0 ? 'red' : 'ink'}>{pendingCount} pendientes</LabelTag>}
      />

      <div className='grid grid-cols-3 gap-4'>
        <StatCard
          label='Total'
          value={quotes.length.toLocaleString('es-MX')}
          icon={Palette}
          tone='ink'
        />
        <StatCard
          label='Pendientes'
          value={pendingCount.toLocaleString('es-MX')}
          sub='Sin atender'
          icon={Inbox}
          tone='red'
        />
        <StatCard
          label='Atendidas'
          value={attendedCount.toLocaleString('es-MX')}
          sub='Resueltas'
          icon={CheckCircle2}
          tone='olive'
        />
      </div>

      <CotizacionesList
        quotes={quotes}
        initialFilter={initialFilter}
      />
    </div>
  )
}

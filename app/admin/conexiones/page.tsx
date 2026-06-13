import { Card, CardContent } from '@/app/components/ui/card'
import { createServiceClient } from '@/lib/supabase/service'
import { Heart } from 'lucide-react'
import { ConnectionsList, type ConnectionEdge, type ConnectionProfile } from './_components/ConnectionsList'

export const metadata = {
  title: 'Conexiones · Admin · Ruidozo MX'
}

interface ConnectionMetrics {
  total_interests: number
  unique_interest_givers: number
  unique_interest_receivers: number
  total_user_proposals: number
  unique_proposers: number
  unique_proposed_to: number
}

function pickProfile(raw: unknown): ConnectionProfile {
  const row = (Array.isArray(raw) ? raw[0] : raw) as {
    display_name?: string | null
    slug?: string | null
    photo_url?: string | null
  } | null
  return {
    name: row?.display_name ?? 'Usuario',
    slug: row?.slug ?? null,
    photo: row?.photo_url ?? null
  }
}

export default async function ConexionesPage() {
  const svc = createServiceClient()

  const [connectionsRes, interestsRes, userProposalsRes] = await Promise.all([
    svc.rpc('connection_metrics'),
    svc
      .from('interests')
      .select(
        'id, message, created_at, from_profile_id, to_profile_id, from_profile:profiles!interests_from_profile_id_fkey(display_name, slug, photo_url), to_profile:profiles!interests_to_profile_id_fkey(display_name, slug, photo_url)'
      )
      .order('created_at', { ascending: false }),
    svc
      .from('user_proposals')
      .select(
        'id, subject, message, created_at, from_profile_id, to_profile_id, from_profile:profiles!user_proposals_from_profile_id_fkey(display_name, slug, photo_url), to_profile:profiles!user_proposals_to_profile_id_fkey(display_name, slug, photo_url)'
      )
      .order('created_at', { ascending: false })
  ])

  const connections = ((connectionsRes.data ?? [])[0] ?? {
    total_interests: 0,
    unique_interest_givers: 0,
    unique_interest_receivers: 0,
    total_user_proposals: 0,
    unique_proposers: 0,
    unique_proposed_to: 0
  }) as ConnectionMetrics

  const rawEdges = [
    ...(interestsRes.data ?? []).map(r => ({
      id: `i-${r.id}`,
      kind: 'interest' as const,
      createdAt: r.created_at,
      fromId: r.from_profile_id as string,
      toId: r.to_profile_id as string,
      from: pickProfile(r.from_profile),
      to: pickProfile(r.to_profile),
      detail: r.message ?? ''
    })),
    ...(userProposalsRes.data ?? []).map(r => ({
      id: `p-${r.id}`,
      kind: 'proposal' as const,
      createdAt: r.created_at,
      fromId: r.from_profile_id as string,
      toId: r.to_profile_id as string,
      from: pickProfile(r.from_profile),
      to: pickProfile(r.to_profile),
      detail: r.subject || r.message || ''
    }))
  ]

  // A connection is mutual when the reverse direction exists within the same kind
  // (both gave "Conectar", or both messaged each other).
  const present = new Set(rawEdges.map(e => `${e.kind}:${e.fromId}->${e.toId}`))

  // Most recent message + timestamp per direction (rawEdges arrive date-desc).
  const metaByDir = new Map<string, { text: string; at: string }>()
  for (const e of rawEdges) {
    const k = `${e.kind}:${e.fromId}->${e.toId}`
    if (!metaByDir.has(k)) metaByDir.set(k, { text: e.detail, at: e.createdAt })
  }

  // Collapse each mutual pair into a single A↔B row, carrying both directions'
  // messages with their timestamps (oldest first → who reached out first).
  const seenMutualPair = new Set<string>()
  const connectionEdges: ConnectionEdge[] = []
  for (const e of rawEdges) {
    const mutual = e.fromId !== e.toId && present.has(`${e.kind}:${e.toId}->${e.fromId}`)
    if (mutual) {
      const pairKey = `${e.kind}:${[e.fromId, e.toId].sort().join('-')}`
      if (seenMutualPair.has(pairKey)) continue
      seenMutualPair.add(pairKey)
    }
    const rev = mutual ? metaByDir.get(`${e.kind}:${e.toId}->${e.fromId}`) : undefined
    const mutualMessages = mutual
      ? [
          { name: e.from.name, text: e.detail, at: e.createdAt },
          { name: e.to.name, text: rev?.text ?? '', at: rev?.at ?? e.createdAt }
        ].sort((a, b) => (a.at < b.at ? -1 : 1))
      : undefined
    connectionEdges.push({
      id: e.id,
      kind: e.kind,
      createdAt: e.createdAt,
      from: e.from,
      to: e.to,
      detail: e.detail,
      mutualMessages,
      mutual
    })
  }
  // Mutual pairs grouped first, then the rest — each block newest to oldest.
  connectionEdges.sort((a, b) => {
    if (a.mutual !== b.mutual) return a.mutual ? -1 : 1
    return a.createdAt < b.createdAt ? 1 : -1
  })

  return (
    <div className='mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-8 sm:py-12'>
      <header>
        <p className='font-pt-mono text-xs tracking-[0.3em] text-red-400/70 uppercase'>Comunidad</p>
        <h1 className='font-baby-doll mt-1 text-4xl font-bold tracking-wider text-white uppercase sm:text-5xl'>
          Conexiones
        </h1>
        <p className='font-pt-mono mt-2 max-w-2xl text-sm text-white/40'>
          Solicitudes de &quot;Conectar&quot; y mensajes directos entre perfiles. Quién busca a quién, y qué se están
          diciendo.
        </p>
      </header>

      <section className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        <SmallStat
          label='Total solicitudes'
          value={connections.total_interests}
        />
        <SmallStat
          label='Quién las envía'
          value={connections.unique_interest_givers}
        />
        <SmallStat
          label='Quién las recibe'
          value={connections.unique_interest_receivers}
        />
        <SmallStat
          label='Mensajes directos'
          value={connections.total_user_proposals}
        />
        <SmallStat
          label='Quién manda mensajes'
          value={connections.unique_proposers}
        />
        <SmallStat
          label='Quién los recibe'
          value={connections.unique_proposed_to}
        />
      </section>

      <section>
        <div className='mb-3 flex items-start gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/60'>
            <Heart className='h-4 w-4' />
          </div>
          <div>
            <h2 className='font-pt-mono text-sm font-bold tracking-wider text-white uppercase'>
              Quién se conecta con quién
            </h2>
            <p className='font-pt-mono text-[11px] text-white/40'>
              Las conexiones mutuas (↔) van primero; el resto, del más reciente al más antiguo. Filtra por tipo arriba.
            </p>
          </div>
        </div>
        <ConnectionsList edges={connectionEdges} />
      </section>
    </div>
  )
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <Card className='gap-1 border-white/10 bg-white/3 py-3'>
      <CardContent className='px-3'>
        <p className='font-pt-mono text-[10px] tracking-widest text-white/40 uppercase'>{label}</p>
        <p className='font-baby-doll mt-1 text-2xl font-bold text-white'>{value.toLocaleString('es-MX')}</p>
      </CardContent>
    </Card>
  )
}

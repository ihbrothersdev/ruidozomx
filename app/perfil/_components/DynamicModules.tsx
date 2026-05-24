import Link from 'next/link'
import type { Role } from '@/lib/types'
import ConnectionActions from './ConnectionActions'
import { ROLE_DYNAMIC_MODULES } from './profile-constants'

export interface SongProposalSummary {
  id: string
  title: string
  artist: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface EventSummary {
  id: string
  title: string
  event_date: string
  event_type: string | null
  venue_name: string | null
  city: string | null
  address: string | null
  description: string | null
  status: 'draft' | 'published' | 'cancelled'
}

export interface InterestSummary {
  id: string
  message: string | null
  created_at: string
  otherProfile: {
    id: string
    slug: string | null
    display_name: string | null
    role: Role | null
    photo_url: string | null
  }
}

interface DynamicModulesProps {
  role: Role
  roleProfile?: Record<string, any> | null
  /** Latest proposals to display (cap to 3 from the page). */
  songProposals?: SongProposalSummary[]
  /** Total proposals submitted by this user (across all time). */
  songProposalsCount?: number
  /** Upcoming events for the profile owner. */
  events?: EventSummary[]
  /** Latest interests received by this user (cap to 5 from the page). */
  receivedConnections?: InterestSummary[]
  receivedConnectionsCount?: number
  /** Latest interests this user sent out (cap to 5 from the page). */
  sentConnections?: InterestSummary[]
  sentConnectionsCount?: number
  /** IDs of profiles with whom the user has a mutual interest (both directions exist). */
  mutualIds?: string[]
}

/** Resolve data for a module: returns an array of items to display as a list */
function getModuleItems(mod: { dataField?: string }, roleProfile?: Record<string, any> | null): string[] {
  if (!mod.dataField || !roleProfile) return []
  const value = roleProfile[mod.dataField]
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    // Split comma-separated text into list items
    return value
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
  }
  return []
}

const STATUS_LABEL: Record<SongProposalSummary['status'], { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-black/10 text-black/70' },
  accepted: { label: 'Aceptada', cls: 'bg-green-600/15 text-green-700' },
  rejected: { label: 'No incluida', cls: 'bg-red-600/15 text-red-700' }
}

type VisibleEntry =
  | { mod: { title: string; key: string }; kind: 'list'; items: string[] }
  | { mod: { title: string; key: string }; kind: 'proposals'; proposals: SongProposalSummary[]; total: number }
  | {
      mod: { title: string; key: string }
      kind: 'events'
      events: EventSummary[]
      /** When set, render this message instead of the events list (empty / disabled state). */
      emptyMessage?: string
    }
  | {
      mod: { title: string; key: string }
      kind: 'connections'
      direction: 'received' | 'sent'
      connections: InterestSummary[]
      total: number
    }

export default function DynamicModules({
  role,
  roleProfile,
  songProposals = [],
  songProposalsCount,
  events = [],
  receivedConnections = [],
  receivedConnectionsCount,
  sentConnections = [],
  sentConnectionsCount,
  mutualIds = []
}: DynamicModulesProps) {
  const modules = ROLE_DYNAMIC_MODULES[role]
  if (!modules || modules.length === 0) return null

  // Always show the latest 3 in the list, regardless of how many came in.
  const proposalsToShow = songProposals.slice(0, 3)
  const proposalsTotal = songProposalsCount ?? songProposals.length

  const receivedTotal = receivedConnectionsCount ?? receivedConnections.length
  const sentTotal = sentConnectionsCount ?? sentConnections.length
  const mutualSet = new Set(mutualIds)

  // Venue-specific: do they accept publishing convocatorias on Ruidozo?
  const venuePublishesCalls = role === 'venue' ? Boolean(roleProfile?.publish_calls_ruidozo) : null

  // Build the visible modules list — drop anything without data.
  const visible: VisibleEntry[] = modules
    .map<VisibleEntry | null>(mod => {
      if (mod.key === 'proposals') {
        return { mod, kind: 'proposals', proposals: proposalsToShow, total: proposalsTotal }
      }

      if (mod.key === 'connections_received') {
        return { mod, kind: 'connections', direction: 'received', connections: receivedConnections, total: receivedTotal }
      }

      if (mod.key === 'connections_sent') {
        return { mod, kind: 'connections', direction: 'sent', connections: sentConnections, total: sentTotal }
      }

      if (mod.key === 'events') {
        // Venues get a special states-machine: opt-out → opt-in-empty → has events.
        if (role === 'venue') {
          if (venuePublishesCalls === false) {
            return {
              mod: { ...mod, title: 'Convocatorias' },
              kind: 'events',
              events: [],
              emptyMessage: 'Este foro no publica convocatorias.'
            }
          }
          if (events.length === 0) {
            return {
              mod,
              kind: 'events',
              events: [],
              emptyMessage: 'Aún no hay convocatorias publicadas.'
            }
          }
          return { mod, kind: 'events', events: events.slice(0, 5) }
        }
        // Other roles: just show events if any, hide if none.
        return { mod, kind: 'events', events: events.slice(0, 5) }
      }

      // 'calls' for venue is redundant with 'events' — skip silently.
      if (mod.key === 'calls' && role === 'venue') return null

      const items = getModuleItems(mod, roleProfile)
      return { mod, kind: 'list', items }
    })
    .filter((entry): entry is VisibleEntry => {
      if (!entry) return false
      if (entry.kind === 'proposals') return entry.total > 0
      if (entry.kind === 'connections') return entry.total > 0
      if (entry.kind === 'events') {
        // Keep when there are events OR there's a forced empty/disabled message.
        return entry.events.length > 0 || !!entry.emptyMessage
      }
      return entry.items.length > 0
    })

  if (visible.length === 0) return null

  return (
    <div className='space-y-4'>
      {visible.map(entry => (
        <div
          key={entry.mod.key}
          className='border border-dashed border-black/20 p-4'
        >
          <div className='flex items-baseline justify-between gap-3'>
            <h4 className='font-pt-mono text-lg font-bold tracking-wider text-black uppercase'>{entry.mod.title}</h4>
            {entry.kind === 'proposals' && (
              <span className='font-pt-mono shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold tracking-wider text-white'>
                {entry.total}
              </span>
            )}
            {entry.kind === 'connections' && (
              <span className='font-pt-mono shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold tracking-wider text-white'>
                {entry.total}
              </span>
            )}
          </div>

          {entry.kind === 'list' && (
            <ul className='mt-2 space-y-1'>
              {entry.items.map((item, i) => (
                <li
                  key={i}
                  className='font-pt-mono flex items-center gap-2 text-sm text-black/80'
                >
                  <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {entry.kind === 'events' && entry.emptyMessage && (
            <p className='font-pt-mono mt-2 text-sm text-black/60 italic'>{entry.emptyMessage}</p>
          )}

          {entry.kind === 'events' && entry.events.length > 0 && (
            <ul className='mt-2 space-y-2.5'>
              {entry.events.map(ev => {
                const dateLabel = new Date(ev.event_date).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
                const place = [ev.venue_name, ev.city].filter(Boolean).join(' · ')
                return (
                  <li
                    key={ev.id}
                    className='flex items-start gap-2 text-sm'
                  >
                    <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' />
                    <div className='font-pt-mono flex min-w-0 flex-1 flex-col gap-0.5'>
                      <span className='font-bold text-black'>{ev.title}</span>
                      <span className='text-xs text-black/60'>
                        {dateLabel}
                        {place && ` · ${place}`}
                        {ev.event_type && ` · ${ev.event_type}`}
                      </span>
                      {ev.address && <span className='text-xs text-black/60'>{ev.address}</span>}
                      {ev.description && <span className='text-xs text-black/70'>{ev.description}</span>}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {entry.kind === 'proposals' && (
            <ul className='mt-2 space-y-1.5'>
              {entry.proposals.map(p => {
                const status = STATUS_LABEL[p.status]
                return (
                  <li
                    key={p.id}
                    className='flex items-start gap-2 text-sm'
                  >
                    <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' />
                    <div className='font-pt-mono flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                      <span className='font-bold text-black'>{p.title}</span>
                      <span className='text-xs text-black/60'>— {p.artist}</span>
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {entry.kind === 'connections' && (
            <ul className='mt-2 space-y-3'>
              {entry.connections.map(c => {
                const other = c.otherProfile
                const name = other.display_name || 'Perfil'
                const initial = name.trim().charAt(0).toUpperCase() || '?'
                const isMutual = mutualSet.has(other.id)
                const dateLabel = new Date(c.created_at).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
                const Avatar = other.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={other.photo_url}
                    alt={name}
                    className='h-8 w-8 shrink-0 rounded-full object-cover'
                  />
                ) : (
                  <span className='font-pt-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-bold text-black/70'>
                    {initial}
                  </span>
                )
                const Identity = (
                  <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                    <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                      <span className='font-pt-mono font-bold text-black'>{name}</span>
                      {other.role && (
                        <span className='font-pt-mono rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-black/70 uppercase'>
                          {other.role}
                        </span>
                      )}
                      {isMutual && (
                        <span className='font-pt-mono rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase'>
                          Mutua ✓
                        </span>
                      )}
                    </div>
                    {c.message && <span className='font-pt-mono text-xs text-black/70'>{c.message}</span>}
                    <span className='font-pt-mono text-[11px] text-black/50'>{dateLabel}</span>
                  </div>
                )
                return (
                  <li
                    key={c.id}
                    className='flex flex-col gap-1.5 text-sm'
                  >
                    <div className='flex items-start gap-3'>
                      {other.slug ? (
                        <Link
                          href={`/perfil/${other.slug}`}
                          className='flex min-w-0 flex-1 items-start gap-3 hover:opacity-80'
                        >
                          {Avatar}
                          {Identity}
                        </Link>
                      ) : (
                        <>
                          {Avatar}
                          {Identity}
                        </>
                      )}
                    </div>
                    <ConnectionActions
                      profileId={other.id}
                      displayName={name}
                      direction={entry.direction}
                      isMutual={isMutual}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

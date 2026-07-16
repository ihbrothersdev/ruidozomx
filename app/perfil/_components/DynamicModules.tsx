import Link from 'next/link'
import { LabelTag, Paper, Stamp, type Tone } from '@/app/admin/_components/kit'
import type { Role } from '@/lib/types'
import ConnectionActions from './ConnectionActions'
import ProposalActions from './ProposalActions'
import { ROLE_DYNAMIC_MODULES } from './profile-constants'

export interface SongProposalSummary {
  id: string
  title: string
  artist: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  /** Owner dashboard only: whether the proposal already has an uploaded MP3. */
  hasAudio?: boolean
  external_link?: string | null
  download_link?: string | null
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
  external_link: string | null
  status: 'published' | 'cancelled'
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

export type UserProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export interface UserProposalSummary {
  id: string
  message: string
  status: UserProposalStatus
  created_at: string
  responded_at: string | null
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
  roleProfile?: Record<string, unknown> | null
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
  /** Latest user proposals received (cap to 5 from the page). */
  receivedProposals?: UserProposalSummary[]
  receivedProposalsCount?: number
  /** Latest user proposals sent (cap to 5 from the page). */
  sentProposals?: UserProposalSummary[]
  sentProposalsCount?: number
}

/** Resolve data for a module: returns an array of items to display as a list */
function getModuleItems(mod: { dataField?: string }, roleProfile?: Record<string, unknown> | null): string[] {
  if (!mod.dataField || !roleProfile) return []
  const value = roleProfile[mod.dataField]
  if (!value) return []
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
  }
  return []
}

const STATUS_LABEL: Record<SongProposalSummary['status'], { label: string; tone: Tone }> = {
  pending: { label: 'Pendiente', tone: 'gold' },
  accepted: { label: 'Aceptada', tone: 'olive' },
  rejected: { label: 'No incluida', tone: 'ink' }
}

const PROPOSAL_STATUS_LABEL: Record<UserProposalStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pendiente', tone: 'gold' },
  accepted: { label: 'Aceptada', tone: 'olive' },
  rejected: { label: 'Rechazada', tone: 'ink' },
  withdrawn: { label: 'Retirada', tone: 'ink' }
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
  | {
      mod: { title: string; key: string }
      kind: 'user_proposals'
      direction: 'received' | 'sent'
      proposals: UserProposalSummary[]
      total: number
    }

/** Build the list of entries that DynamicModules would render. Exported so
 *  callers (e.g. ProfileView) can know whether any content will show without
 *  having to duplicate the per-module visibility logic. */
export function computeVisibleDynamicEntries({
  role,
  roleProfile,
  songProposals = [],
  songProposalsCount,
  events = [],
  receivedConnections = [],
  receivedConnectionsCount,
  sentConnections = [],
  sentConnectionsCount,
  receivedProposals = [],
  receivedProposalsCount,
  sentProposals = [],
  sentProposalsCount
}: DynamicModulesProps): VisibleEntry[] {
  const modules = ROLE_DYNAMIC_MODULES[role]
  if (!modules || modules.length === 0) return []

  const proposalsToShow = songProposals.slice(0, 3)
  const proposalsTotal = songProposalsCount ?? songProposals.length

  const receivedTotal = receivedConnectionsCount ?? receivedConnections.length
  const sentTotal = sentConnectionsCount ?? sentConnections.length
  const receivedProposalsTotal = receivedProposalsCount ?? receivedProposals.length
  const sentProposalsTotal = sentProposalsCount ?? sentProposals.length

  // Venue-specific: do they accept publishing convocatorias on Ruidozo?
  const venuePublishesCalls = role === 'venue' ? Boolean(roleProfile?.publish_calls_ruidozo) : null

  return modules
    .map<VisibleEntry | null>(mod => {
      if (mod.key === 'proposals') {
        return { mod, kind: 'proposals', proposals: proposalsToShow, total: proposalsTotal }
      }

      if (mod.key === 'connections_received') {
        return {
          mod,
          kind: 'connections',
          direction: 'received',
          connections: receivedConnections,
          total: receivedTotal
        }
      }

      if (mod.key === 'connections_sent') {
        return { mod, kind: 'connections', direction: 'sent', connections: sentConnections, total: sentTotal }
      }

      if (mod.key === 'user_proposals_received') {
        return {
          mod,
          kind: 'user_proposals',
          direction: 'received',
          proposals: receivedProposals,
          total: receivedProposalsTotal
        }
      }

      if (mod.key === 'user_proposals_sent') {
        return {
          mod,
          kind: 'user_proposals',
          direction: 'sent',
          proposals: sentProposals,
          total: sentProposalsTotal
        }
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
      if (entry.kind === 'user_proposals') return entry.total > 0
      if (entry.kind === 'events') {
        return entry.events.length > 0 || !!entry.emptyMessage
      }
      return entry.items.length > 0
    })
}

export default function DynamicModules(props: DynamicModulesProps) {
  const visible = computeVisibleDynamicEntries(props)
  if (visible.length === 0) return null

  const mutualSet = new Set(props.mutualIds ?? [])

  return (
    <div className='space-y-4'>
      {visible.map(entry => (
        <Paper
          key={entry.mod.key}
          className='p-4'
        >
          <div className='flex items-baseline justify-between gap-3'>
            <h4 className='font-pt-mono text-lg font-bold tracking-wider text-admin-ink uppercase'>{entry.mod.title}</h4>
            {(entry.kind === 'proposals' || entry.kind === 'connections' || entry.kind === 'user_proposals') && (
              <LabelTag tone='red'>{entry.total}</LabelTag>
            )}
          </div>

          {entry.kind === 'list' && (
            <ul className='mt-2 space-y-1'>
              {entry.items.map((item, i) => (
                <li
                  key={i}
                  className='font-pt-mono flex items-center gap-2 text-sm text-admin-ink-soft'
                >
                  <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-admin-red' />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {entry.kind === 'events' && entry.emptyMessage && (
            <p className='font-pt-mono mt-2 text-sm text-admin-ink-faint italic'>{entry.emptyMessage}</p>
          )}

          {entry.kind === 'events' && entry.events.length > 0 && (
            <ul className='mt-2 space-y-2.5'>
              {entry.events.map(ev => {
                // `event_date` is a plain YYYY-MM-DD (column type `date`).
                // Append a local-time component so JS interprets it in the
                // viewer's timezone instead of UTC (which would shift the
                // displayed day back by the offset for users west of UTC).
                const dateLabel = new Date(`${ev.event_date}T00:00:00`).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
                const place = [ev.venue_name, ev.city].filter(Boolean).join(' · ')
                // Only render as a clickable anchor when `external_link` is a
                // real http(s) URL. Anything else (free-form text, addresses,
                // phone numbers, etc.) falls back to plain text so users don't
                // try to open a non-link.
                let externalHref: string | null = null
                let externalHost: string | null = null
                if (ev.external_link) {
                  try {
                    const parsed = new URL(ev.external_link)
                    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                      externalHref = parsed.toString()
                      externalHost = parsed.host.replace(/^www\./, '')
                    }
                  } catch {
                    externalHref = null
                  }
                }
                return (
                  <li
                    key={ev.id}
                    className='flex items-start gap-2 text-sm'
                  >
                    <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-admin-red' />
                    <div className='font-pt-mono flex min-w-0 flex-1 flex-col gap-0.5'>
                      <span className='font-bold text-admin-ink'>{ev.title}</span>
                      <span className='text-xs text-admin-ink-faint'>
                        {dateLabel}
                        {place && ` · ${place}`}
                        {ev.event_type && ` · ${ev.event_type}`}
                      </span>
                      {ev.address && <span className='text-xs text-admin-ink-faint'>{ev.address}</span>}
                      {ev.description && <span className='text-xs text-admin-ink-soft'>{ev.description}</span>}
                      {ev.external_link &&
                        (externalHref ? (
                          <a
                            href={externalHref}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='mt-0.5 inline-block w-fit max-w-full truncate text-xs font-bold tracking-wider text-admin-red uppercase underline underline-offset-2 hover:text-admin-red/70'
                          >
                            Más info ↗{externalHost ? ` · ${externalHost}` : ''}
                          </a>
                        ) : (
                          <span className='mt-0.5 text-xs text-admin-ink-soft'>
                            <span className='font-bold tracking-wider uppercase'>Más info:</span> {ev.external_link}
                          </span>
                        ))}
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
                    className='flex items-center gap-2 text-sm'
                  >
                    <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-admin-red' />
                    <div className='font-pt-mono min-w-0 flex-1 truncate'>
                      <span className='font-bold text-admin-ink'>{p.title}</span>
                      <span className='text-xs text-admin-ink-faint'> — {p.artist}</span>
                    </div>
                    <Stamp
                      tone={status.tone}
                      className='shrink-0'
                    >
                      {status.label}
                    </Stamp>
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
                    className='h-8 w-8 shrink-0 rounded-full border-2 border-admin-ink object-cover'
                  />
                ) : (
                  <span className='font-pt-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-admin-ink bg-admin-surface-2 text-xs font-bold text-admin-ink-soft'>
                    {initial}
                  </span>
                )
                const Identity = (
                  <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                    <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                      <span className='font-pt-mono font-bold text-admin-ink'>{name}</span>
                      {other.role && (
                        <span className='font-pt-mono border border-admin-ink bg-admin-surface px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-admin-ink-soft uppercase'>
                          {other.role}
                        </span>
                      )}
                      {isMutual && (
                        <span className='font-pt-mono border border-admin-ink bg-admin-olive px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-admin-surface uppercase'>
                          Mutua ✓
                        </span>
                      )}
                    </div>
                    {c.message && <span className='font-pt-mono text-xs text-admin-ink-soft'>{c.message}</span>}
                    <span className='font-pt-mono text-[11px] text-admin-ink-faint'>{dateLabel}</span>
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

          {entry.kind === 'user_proposals' && (
            <ul className='mt-2 space-y-3'>
              {entry.proposals.map(p => {
                const other = p.otherProfile
                const name = other.display_name || 'Perfil'
                const initial = name.trim().charAt(0).toUpperCase() || '?'
                const statusInfo = PROPOSAL_STATUS_LABEL[p.status]
                const dateLabel = new Date(p.created_at).toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
                const Avatar = other.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={other.photo_url}
                    alt={name}
                    className='h-8 w-8 shrink-0 rounded-full border-2 border-admin-ink object-cover'
                  />
                ) : (
                  <span className='font-pt-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-admin-ink bg-admin-surface-2 text-xs font-bold text-admin-ink-soft'>
                    {initial}
                  </span>
                )
                const Identity = (
                  <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                    <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                      <span className='font-pt-mono font-bold text-admin-ink'>{name}</span>
                      {other.role && (
                        <span className='font-pt-mono border border-admin-ink bg-admin-surface px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-admin-ink-soft uppercase'>
                          {other.role}
                        </span>
                      )}
                      <Stamp tone={statusInfo.tone}>{statusInfo.label}</Stamp>
                    </div>
                    <p className='font-pt-mono line-clamp-3 text-xs text-admin-ink-soft'>{p.message}</p>
                    <span className='font-pt-mono text-[11px] text-admin-ink-faint'>{dateLabel}</span>
                  </div>
                )
                return (
                  <li
                    key={p.id}
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
                    <ProposalActions
                      proposalId={p.id}
                      displayName={name}
                      direction={entry.direction}
                      status={p.status}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </Paper>
      ))}
    </div>
  )
}

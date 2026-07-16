'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { LabelTag, Paper, Stamp, type Tone } from '@/app/admin/_components/kit'
import { ROLE_LABELS, type FeaturedSongView, type Role } from '@/lib/types'
import type { EventSummary, InterestSummary, SongProposalSummary, UserProposalSummary } from './DynamicModules'
import LinksSection from './LinksSection'
import OwnProfileActions from './OwnProfileActions'
import OwnProfileEditForm from './OwnProfileEditForm'
import ProfileFeaturedSongs from './ProfileFeaturedSongs'
import ProponerRolaBandaModal from './ProponerRolaBandaModal'
import ProposedSongAudioUpload from './ProposedSongAudioUpload'
import { ProfileInbox } from './inbox/ProfileInbox'

export interface OwnProfileViewProps {
  displayName: string
  role: Role | null
  location: string
  photoUrl: string | null
  contact: string | null
  socialLinks: Record<string, string> | null
  roleProfile: Record<string, unknown> | null
  bio?: string
  songProposals?: SongProposalSummary[]
  songProposalsCount?: number
  events?: EventSummary[]
  lastActivityAt: string | null
  // Accepted but not yet rendered — the inbox section is still TODO. These
  // come pre-fetched from the page so they don't duplicate queries once the
  // inbox lands. Keeping them optional + permissive avoids a prop-drilling
  // refactor when the section finally ships.
  receivedConnections?: InterestSummary[]
  receivedConnectionsCount?: number
  sentConnections?: InterestSummary[]
  sentConnectionsCount?: number
  mutualIds?: string[]
  receivedProposals?: UserProposalSummary[]
  receivedProposalsCount?: number
  sentProposals?: UserProposalSummary[]
  sentProposalsCount?: number
  /** Raw location pieces — kept for future editable form; not yet rendered. */
  country?: string | null
  state?: string | null
  city?: string | null
  /** Fan only: upcoming events near the fan's city. */
  nearbyEvents?: EventSummary[]
  /** The profile's own id — needed to scope its featured-songs playlist. */
  profileId?: string
  /** Band only: rolas the band can feature (proposals + cassette tracks). */
  featuredCandidates?: FeaturedSongView[]
  /** Band only: curated rolas shown publicly (preview, with inline playback). */
  featuredSongs?: FeaturedSongView[]
  /** Band only: currently featured `type:id` keys, in order. */
  featuredSelected?: string[]
}

export default function OwnProfileView({
  displayName,
  photoUrl,
  role,
  location,
  roleProfile,
  bio,
  contact,
  socialLinks,
  country,
  state,
  city,
  songProposals = [],
  receivedProposalsCount = 0,
  events = [],
  receivedConnectionsCount = 0,
  songProposalsCount = 0,
  receivedProposals = [],
  sentProposals = [],
  sentProposalsCount = 0,
  receivedConnections = [],
  sentConnections = [],
  sentConnectionsCount = 0,
  mutualIds = [],
  nearbyEvents = [],
  profileId,
  featuredCandidates = [],
  featuredSongs = [],
  featuredSelected = []
}: OwnProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Inline edit: clicking "Editar perfil" swaps the read-only dashboard for an
  // editable form that keeps the same red-folder design. No route, no URL param.
  if (isEditing) {
    return (
      <OwnProfileEditForm
        displayName={displayName}
        role={role}
        location={location}
        photoUrl={photoUrl}
        bio={bio}
        contact={contact}
        socialLinks={socialLinks}
        roleProfile={roleProfile}
        country={country ?? ''}
        state={state ?? ''}
        city={city ?? ''}
        featuredCandidates={featuredCandidates}
        featuredSelected={featuredSelected}
        events={events}
        onExitEdit={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className='admin-root relative min-h-screen'>
      {/* Riso grain — the same kraft-paper membrete wash used across Mesa de Control. */}
      <div
        aria-hidden
        className='pointer-events-none fixed inset-0 z-0 opacity-[0.12] mix-blend-multiply'
        style={{ backgroundImage: "url('/assets/membrete-background.png')", backgroundSize: 'cover' }}
      />

      <div className='relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6'>
        {/* Masthead: framed photo + name + logo. */}
        <header className='mb-8 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left'>
            <PolaroidCard
              photoUrl={photoUrl}
              displayName={displayName}
            />
            <div className='min-w-0'>
              <LabelTag tone='red'>{role ? ROLE_LABELS[role] : 'Perfil'}</LabelTag>
              <h1 className='font-baby-doll mt-3 text-4xl leading-[0.85] font-bold tracking-wide text-admin-ink uppercase sm:text-5xl'>
                {displayName}
              </h1>
              <div className='mt-2 h-[3px] w-24 bg-admin-red' />
            </div>
          </div>
          <Link
            href='/'
            aria-label='Ir al inicio'
            className='transition-transform hover:scale-105'
          >
            <Image
              src='/assets/logo.png'
              alt='Ruidozo'
              width={380}
              height={183}
              className='h-12 w-auto sm:h-16 lg:h-20'
              priority
            />
          </Link>
        </header>

        {/* Mobile only: action buttons right below the user photo/logo */}
        <div className='mb-6 flex justify-center lg:hidden'>
          <OwnProfileActions
            role={role}
            onEdit={() => setIsEditing(true)}
          />
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Left column */}
          <div className='space-y-6'>
            <DataFields
              displayName={displayName}
              location={location}
              role={role}
              bio={bio}
            />

            <ActivityInbox
              role={role}
              receivedProposalsCount={receivedProposalsCount}
              eventsCount={events.length}
              receivedConnectionsCount={receivedConnectionsCount}
            />

            <EventsSection
              role={role}
              events={events}
            />

            <ServicesSection
              role={role}
              roleProfile={roleProfile ?? null}
            />

            <ProposedSongs
              role={role}
              songs={songProposals}
              total={songProposalsCount}
            />
          </div>

          {/* Right column — centered on mobile, right-aligned on lg+ */}
          <div className='flex flex-col items-end space-y-6'>
            {featuredSongs.length > 0 && profileId && (
              <div className='w-full'>
                <ProfileFeaturedSongs
                  songs={featuredSongs}
                  profileId={profileId}
                />
              </div>
            )}

            <div className='w-full'>
              <LinksSection
                socialLinks={socialLinks}
                contact={contact}
                variant='private'
              />
            </div>

            <div className='hidden lg:block'>
              <OwnProfileActions
                role={role}
                onEdit={() => setIsEditing(true)}
              />
            </div>

            <RoleModules
              role={role}
              roleProfile={roleProfile ?? null}
            />

            <FanFavorites
              role={role}
              roleProfile={roleProfile ?? null}
            />

            {/* <FanNearbyEvents
              role={role}
              events={nearbyEvents}
            /> */}
          </div>
        </div>

        {/* Full-width inbox: connections + proposals received/sent. */}
        <ProfileInbox
          receivedConnections={receivedConnections}
          sentConnections={sentConnections}
          receivedProposals={receivedProposals}
          sentProposals={sentProposals}
          receivedConnectionsCount={receivedConnectionsCount}
          sentConnectionsCount={sentConnectionsCount}
          receivedProposalsCount={receivedProposalsCount}
          sentProposalsCount={sentProposalsCount}
          mutualIds={mutualIds}
        />
      </div>
    </div>
  )
}

/* ── Subcomponents ─────────────────────────────────────────────────────── */

// ── Right-column modules ────────────────────────────────────────────────────

const FIELD_LABEL = 'font-pt-mono text-[11px] font-bold tracking-[0.15em] text-admin-ink-soft uppercase'
const VALUE_TEXT = 'font-pt-mono text-sm tracking-wide text-admin-ink uppercase'

function RoleModules({ role, roleProfile }: { role: Role | null; roleProfile: Record<string, unknown> | null }) {
  if (!role || !roleProfile) return null

  const modules: { title: string; values: string[] }[] = []

  // Manager / Agente — artists they represent
  if ((role === 'manager' || role === 'agente') && roleProfile.artists_represented) {
    const raw = roleProfile.artists_represented
    const list = Array.isArray(raw)
      ? (raw as string[]).filter(Boolean)
      : typeof raw === 'string'
        ? (raw as string)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : []
    if (list.length > 0) modules.push({ title: 'Artistas representados', values: list })
  }

  // Venue — capacity, audio, lighting
  if (role === 'venue') {
    const venueLines: string[] = []
    if (roleProfile.capacity) venueLines.push(`Capacidad: ${roleProfile.capacity}`)
    if (roleProfile.has_audio) venueLines.push('Audio propio')
    if (roleProfile.has_lighting) venueLines.push('Iluminación')
    if (venueLines.length > 0) modules.push({ title: 'Datos del venue', values: venueLines })
  }

  // Note: proveedor's services live in the LEFT column (ServicesSection),
  // matching the mockup — not here.

  if (modules.length === 0) return null

  return (
    <div className='w-full space-y-4'>
      {modules.map(mod => (
        <div
          key={mod.title}
          className='space-y-2'
        >
          <LabelTag tone='red'>{mod.title}</LabelTag>
          <Paper
            flat
            className='space-y-1 px-3 py-2'
          >
            {mod.values.map((v, i) => (
              <div
                key={i}
                className={VALUE_TEXT}
              >
                {v}
              </div>
            ))}
          </Paper>
        </div>
      ))}
    </div>
  )
}

// ── Left-column sections ─────────────────────────────────────────────────────

interface EventsSectionProps {
  role: Role | null
  events: EventSummary[]
}

const EVENTS_ROLES: Role[] = ['banda', 'venue', 'agente', 'promotor', 'manager']

function EventsSection({ role, events }: EventsSectionProps) {
  if (!role || !EVENTS_ROLES.includes(role)) return null

  return (
    <div
      id='eventos'
      className='scroll-mt-24 space-y-2'
    >
      <LabelTag tone='red'>Eventos publicados</LabelTag>

      {events.length === 0 ? (
        <Paper
          flat
          className='px-3 py-2'
        >
          <p className='font-pt-mono text-sm tracking-wide text-admin-ink-faint uppercase'>
            Este perfil no publica fechas aún
          </p>
        </Paper>
      ) : (
        <Paper
          flat
          className='space-y-2 px-3 py-2'
        >
          {events.map(ev => {
            const dateLabel = new Date(`${ev.event_date}T00:00:00`).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
            return (
              <div
                key={ev.id}
                className='font-pt-mono text-sm text-admin-ink uppercase'
              >
                <span className='font-bold'>{ev.title}</span>
                <span className='text-admin-ink-faint'> · {dateLabel}</span>
                {ev.city && <span className='text-admin-ink-faint'> · {ev.city}</span>}
                {ev.event_type && <span className='text-admin-ink-faint'> · {ev.event_type}</span>}
              </div>
            )
          })}
        </Paper>
      )}
    </div>
  )
}

/**
 * Proveedor-only: their published services catalog (driven by `service_types`).
 * Lives in the left column — the analogue of EventsSection for other roles.
 */
function ServicesSection({ role, roleProfile }: { role: Role | null; roleProfile: Record<string, unknown> | null }) {
  if (role !== 'proveedor') return null

  const raw = roleProfile?.service_types
  const services = Array.isArray(raw) ? (raw as string[]).filter(Boolean) : []

  return (
    <div className='space-y-2'>
      <LabelTag tone='red'>Servicios publicados</LabelTag>

      {services.length === 0 ? (
        <Paper
          flat
          className='px-3 py-2'
        >
          <p className='font-pt-mono text-sm tracking-wide text-admin-ink-faint uppercase'>
            Este perfil no publica servicios aún
          </p>
        </Paper>
      ) : (
        <Paper
          flat
          className='space-y-1 px-3 py-2'
        >
          {services.map((s, i) => (
            <div
              key={i}
              className={VALUE_TEXT}
            >
              {s}
            </div>
          ))}
        </Paper>
      )}
    </div>
  )
}

// ── Fan-only sections ────────────────────────────────────────────────────────

/** Fan (left): their proposed songs shown as a box, empty box if none. */
const SONG_STATUS_LABEL: Record<SongProposalSummary['status'], { label: string; tone: Tone }> = {
  pending: { label: 'Pendiente', tone: 'gold' },
  accepted: { label: 'Aceptada', tone: 'olive' },
  rejected: { label: 'No incluida', tone: 'ink' }
}

/**
 * Songs the user proposed to the cassette — same content as the public
 * profile (title — artist + status badge), shown for any role that has
 * proposed at least one. The count badge shows the all-time total; the list
 * shows them newest-first and scrolls when there are many.
 */
function ProposedSongs({ role, songs, total }: { role: Role | null; songs: SongProposalSummary[]; total: number }) {
  const [editing, setEditing] = useState<SongProposalSummary | null>(null)

  if (role === 'admin' || total === 0) return null

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-3'>
        <LabelTag tone='red'>Rolas propuestas al cassete</LabelTag>
        <LabelTag>{total}</LabelTag>
      </div>
      <Paper
        flat
        className='max-h-64 overflow-y-auto px-3 py-2'
      >
        <ul className='space-y-1.5'>
          {songs.map(p => {
            const status = SONG_STATUS_LABEL[p.status]
            return (
              <li
                key={p.id}
                className='flex items-center gap-2 text-sm'
              >
                <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-admin-red' />
                <span className='font-pt-mono min-w-0 flex-1 truncate'>
                  <span className='font-bold text-admin-ink uppercase'>{p.title}</span>
                  <span className='text-xs text-admin-ink-faint'> — {p.artist}</span>
                </span>
                <div className='flex shrink-0 items-center gap-1.5'>
                  {p.hasAudio === false && <ProposedSongAudioUpload proposalId={p.id} />}
                  <Stamp
                    tone={status.tone}
                    rotate={false}
                  >
                    {status.label}
                  </Stamp>
                  {p.status !== 'accepted' && (
                    <button
                      type='button'
                      onClick={() => setEditing(p)}
                      className='cursor-pointer font-pt-mono text-[10px] font-bold tracking-wider text-admin-red uppercase underline transition-opacity hover:opacity-70'
                    >
                      Editar
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Paper>

      {editing && (
        <ProponerRolaBandaModal
          key={editing.id}
          open
          onOpenChange={open => {
            if (!open) setEditing(null)
          }}
          bandName=''
          showVibes={false}
          proposalId={editing.id}
          initialTitle={editing.title}
          initialArtist={editing.artist}
          initialListenLink={editing.external_link ?? ''}
          initialDownloadLink={editing.download_link ?? ''}
          initialHasAudio={editing.hasAudio}
        />
      )}
    </div>
  )
}

/** Fan (right): favorite genres / bands they like. */
function FanFavorites({ role, roleProfile }: { role: Role | null; roleProfile: Record<string, unknown> | null }) {
  if (role !== 'fan') return null

  const raw = roleProfile?.favorite_genres
  const list = Array.isArray(raw) ? (raw as string[]).filter(Boolean) : []

  return (
    <div className='w-full space-y-2'>
      <LabelTag tone='red'>Bandas o proyectos que le gustan</LabelTag>
      <Paper
        flat
        className='min-h-24 space-y-1 px-3 py-2'
      >
        {list.map((g, i) => (
          <div
            key={i}
            className={VALUE_TEXT}
          >
            {g}
          </div>
        ))}
      </Paper>
    </div>
  )
}

/** Fan (right): upcoming events near the fan's city. */
// TODO: Hide for now
// function FanNearbyEvents({ role, events }: { role: Role | null; events: EventSummary[] }) {
//   if (role !== 'fan') return null

//   return (
//     <div className='w-full space-y-1'>
//       <p className={MODULE_LABEL}>Eventos cerca</p>
//       <div className={MODULE_BOX + ' min-h-24 space-y-1'}>
//         {events.map(ev => {
//           const dateLabel = new Date(ev.event_date).toLocaleDateString('es-MX', {
//             day: '2-digit',
//             month: 'short'
//           })
//           return (
//             <div key={ev.id} className='leading-tight'>
//               <span className='font-bold'>{ev.title}</span>
//               <span className='text-black/60'> · {dateLabel}</span>
//               {ev.city && <span className='text-black/60'> · {ev.city}</span>}
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

interface ActivityInboxProps {
  role: Role | null
  receivedProposalsCount: number
  eventsCount: number
  receivedConnectionsCount: number
}

/**
 * Role-gated activity inbox: 4 links, each only shown when the role makes
 * it relevant.
 *
 * | Item                        | Shown for                                    |
 * |-----------------------------|----------------------------------------------|
 * | Recibiste una propuesta     | All except fan & admin                       |
 * | Publicaste un evento        | banda, venue, agente, promotor, manager      |
 * | Alguien quiere conectar     | All except admin                             |
 * | Rolas propuestas al cassete  | All except admin                             |
 */
function ActivityInbox({ role, receivedProposalsCount, eventsCount, receivedConnectionsCount }: ActivityInboxProps) {
  // fan and admin see no inbox
  const INBOX_ROLES: Role[] = ['agente', 'manager', 'banda', 'promotor', 'proveedor', 'venue']
  if (!role || !INBOX_ROLES.includes(role)) return null

  // Proveedor publishes "ofertas" instead of "eventos"
  const publishLabel = role === 'proveedor' ? 'Publicaste una oferta' : 'Publicaste un evento'

  // Note: "Rolas propuestas al cassete" is rendered as its own ProposedSongs
  // section (with the actual songs + status), so it's intentionally NOT here.
  const items = [
    { label: 'Recibiste una propuesta', href: '#propuestas', count: receivedProposalsCount },
    { label: publishLabel, href: '#eventos', count: eventsCount },
    { label: 'Alguien quiere conectar contigo', href: '#conexiones', count: receivedConnectionsCount }
  ].filter(i => i.count > 0)

  if (items.length === 0) return null

  return (
    <div className='space-y-2'>
      {items.map(item => (
        <a
          key={item.label}
          href={item.href}
          className='font-pt-mono flex items-center gap-2 text-base font-bold tracking-wider text-admin-red uppercase transition-opacity hover:opacity-70'
        >
          {item.label}
          {item.count > 0 && <LabelTag>{item.count}</LabelTag>}
        </a>
      ))}
    </div>
  )
}

interface DataFieldsProps {
  displayName: string
  location: string
  role: Role | null
  bio?: string
}

/**
 * Read-only "form-style" block showing the user's base data:
 * Nombre/Alias, Ciudad/País, Rol. Each field is a label + a red-bordered
 * box containing the value. Display only — actual editing happens inline when
 * the user clicks "Editar perfil", which swaps in OwnProfileEditForm.
 */
function DataFields({ displayName, location, role, bio }: DataFieldsProps) {
  const fields: { label: string; value: string }[] = [
    { label: 'Nombre/Alias/Proyecto/Marca', value: displayName },
    { label: 'Ciudad / País', value: location || '—' },
    { label: 'Rol', value: role ? ROLE_LABELS[role] : '—' }
  ]

  return (
    <div className='space-y-2'>
      {fields.map(f => (
        <div
          key={f.label}
          className='space-y-1'
        >
          <p className={FIELD_LABEL}>{f.label}</p>
          <Paper
            flat
            className='px-3 py-1.5'
          >
            <p className={VALUE_TEXT}>{f.value}</p>
          </Paper>
        </div>
      ))}

      {bio?.trim() && (
        <div className='space-y-1'>
          <p className={FIELD_LABEL}>Descripción</p>
          <Paper
            flat
            className='px-3 py-1.5'
          >
            <p className='font-pt-mono text-sm whitespace-pre-wrap text-admin-ink'>{bio}</p>
          </Paper>
        </div>
      )}
    </div>
  )
}

interface PolaroidCardProps {
  photoUrl: string | null
  displayName: string
}

/**
 * Photo card shown in the masthead: a hard ink-framed print with a strip of
 * tape at the top, the Mesa de Control take on the old polaroid. Falls back to
 * the user's initial when there's no photo.
 */
function PolaroidCard({ photoUrl, displayName }: PolaroidCardProps) {
  return (
    <div className='relative w-32 shrink-0 sm:w-36'>
      {/* Tape strip pinning the print to the desk. */}
      <span
        aria-hidden
        className='absolute -top-2.5 left-1/2 z-10 h-5 w-20 -translate-x-1/2 -rotate-2 border border-admin-ink/20 bg-admin-paper-deep/80'
      />
      <div
        className='admin-card overflow-hidden p-0'
        style={{ aspectRatio: '233 / 291' }}
      >
        {photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photoUrl}
            alt={displayName}
            className='h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-admin-surface-2'>
            <span className='font-baby-doll text-5xl font-bold text-admin-ink/30 uppercase'>
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

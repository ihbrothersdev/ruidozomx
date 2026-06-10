'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ROLE_LABELS, type Role } from '@/lib/types'
import type { EventSummary, InterestSummary, SongProposalSummary, UserProposalSummary } from './DynamicModules'
import LinksSection from './LinksSection'
import OwnProfileActions from './OwnProfileActions'
import OwnProfileEditForm from './OwnProfileEditForm'
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
  nearbyEvents = []
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
        onExitEdit={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Full-screen red background — same asset as the registration form. */}
      <Image
        src='/assets/registro/formulario/shared/red-back.png'
        alt=''
        fill
        className='object-cover'
        priority
      />

      <div className='relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6'>
        {/* Grey folder card (matches the formulario shell). */}
        <div className='relative w-full overflow-hidden'>
          {/* Mobile: simple rectangular background */}
          <Image
            src='/assets/registro/formulario/shared/folder-grey-back-mobile.png'
            alt=''
            fill
            className='object-cover lg:hidden'
          />
          {/* Desktop: folder with tab cut */}
          <Image
            src='/assets/registro/formulario/shared/folder-grey-back.png'
            alt=''
            fill
            className='hidden object-fill lg:block'
          />

          {/* Top decoration: rayo on the right corner */}
          <Image
            src='/assets/registro/formulario/shared/rayo.png'
            alt=''
            width={80}
            height={120}
            className='absolute right-3 z-10 h-10 w-auto'
          />

          <div className='relative z-10 px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 lg:px-12 lg:pt-12 lg:pb-12'>
            {/* Header: stacked & centered on mobile; broche left + logo right on sm+ */}
            <div className='mb-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:mb-8'>
              <PolaroidCard
                photoUrl={photoUrl}
                displayName={displayName}
              />
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
            </div>

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
      </div>
    </div>
  )
}

/* ── Subcomponents ─────────────────────────────────────────────────────── */

// ── Right-column modules ────────────────────────────────────────────────────

const MODULE_LABEL = 'font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'
const MODULE_BOX = 'font-pt-mono w-full border-2 border-red-700 px-3 py-2 text-sm tracking-wider text-black uppercase'

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
          className='space-y-1'
        >
          <p className={MODULE_LABEL}>{mod.title}</p>
          <div className={MODULE_BOX}>
            {mod.values.map((v, i) => (
              <div key={i}>{v}</div>
            ))}
          </div>
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
      <p className='font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'>Eventos publicados</p>

      {events.length === 0 ? (
        <>
          <div className='font-pt-mono border-2 border-red-700 px-3 py-1.5 text-sm tracking-wider text-black/60 uppercase'>
            Este perfil no publica fechas aún
          </div>
        </>
      ) : (
        <div className='space-y-2 border-2 border-red-700 px-3 py-2'>
          {events.map(ev => {
            const dateLabel = new Date(ev.event_date).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
            return (
              <div
                key={ev.id}
                className='font-pt-mono text-sm text-black uppercase'
              >
                <span className='font-bold'>{ev.title}</span>
                <span className='text-black/60'> · {dateLabel}</span>
                {ev.city && <span className='text-black/60'> · {ev.city}</span>}
                {ev.event_type && <span className='text-black/60'> · {ev.event_type}</span>}
              </div>
            )
          })}
        </div>
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
      <p className='font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'>Servicios publicados</p>

      {services.length === 0 ? (
        <div className='font-pt-mono border-2 border-red-700 px-3 py-1.5 text-sm tracking-wider text-black/60 uppercase'>
          Este perfil no publica servicios aún
        </div>
      ) : (
        <div className='space-y-1 border-2 border-red-700 px-3 py-2'>
          {services.map((s, i) => (
            <div
              key={i}
              className='font-pt-mono text-sm text-black uppercase'
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Fan-only sections ────────────────────────────────────────────────────────

/** Fan (left): their proposed songs shown as a box, empty box if none. */
const SONG_STATUS_LABEL: Record<SongProposalSummary['status'], { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-black/10 text-black/70' },
  accepted: { label: 'Aceptada', cls: 'bg-green-600/15 text-green-700' },
  rejected: { label: 'No incluida', cls: 'bg-red-600/15 text-red-700' }
}

/**
 * Songs the user proposed to the cassette — same content as the public
 * profile (title — artist + status badge), shown for any role that has
 * proposed at least one. The count badge shows the all-time total; the list
 * shows the latest few (capped by the page query).
 */
function ProposedSongs({ role, songs, total }: { role: Role | null; songs: SongProposalSummary[]; total: number }) {
  if (role === 'admin' || total === 0) return null

  return (
    <div className='space-y-2'>
      <div className='flex items-baseline justify-between gap-3'>
        <p className='font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'>
          Rolas propuestas al casete
        </p>
        <span className='font-pt-mono shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold tracking-wider text-white'>
          {total}
        </span>
      </div>
      <ul className='space-y-1.5 border-2 border-red-700 px-3 py-2'>
        {songs.map(p => {
          const status = SONG_STATUS_LABEL[p.status]
          return (
            <li
              key={p.id}
              className='flex items-start gap-2 text-sm'
            >
              <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' />
              <div className='font-pt-mono flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                <span className='font-bold text-black uppercase'>{p.title}</span>
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
    </div>
  )
}

/** Fan (right): favorite genres / bands they like. */
function FanFavorites({ role, roleProfile }: { role: Role | null; roleProfile: Record<string, unknown> | null }) {
  if (role !== 'fan') return null

  const raw = roleProfile?.favorite_genres
  const list = Array.isArray(raw) ? (raw as string[]).filter(Boolean) : []

  return (
    <div className='w-full space-y-1'>
      <p className={MODULE_LABEL}>Bandas o proyectos que le gustan</p>
      <div className={MODULE_BOX + ' min-h-24 space-y-1'}>
        {list.map((g, i) => (
          <div key={i}>{g}</div>
        ))}
      </div>
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
 * | Rolas propuestas al casete  | All except admin                             |
 */
function ActivityInbox({ role, receivedProposalsCount, eventsCount, receivedConnectionsCount }: ActivityInboxProps) {
  // fan and admin see no inbox
  const INBOX_ROLES: Role[] = ['agente', 'manager', 'banda', 'promotor', 'proveedor', 'venue']
  if (!role || !INBOX_ROLES.includes(role)) return null

  // Proveedor publishes "ofertas" instead of "eventos"
  const publishLabel = role === 'proveedor' ? 'Publicaste una oferta' : 'Publicaste un evento'

  // Note: "Rolas propuestas al casete" is rendered as its own ProposedSongs
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
          className='font-pt-mono flex items-center gap-2 text-base font-bold tracking-wider text-red-700 uppercase transition-opacity hover:opacity-70'
        >
          {item.label}
          {item.count > 0 && (
            <span className='font-pt-mono shrink-0 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white'>
              {item.count}
            </span>
          )}
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
          <p className='font-pt-mono text-sm tracking-wider text-red-700 uppercase'>{f.label}</p>
          <div className='font-pt-mono border-2 border-red-700 bg-transparent px-3 py-1.5 text-sm tracking-wider text-black uppercase'>
            {f.value}
          </div>
        </div>
      ))}

      {bio?.trim() && (
        <div className='space-y-1'>
          <p className='font-pt-mono text-sm tracking-wider text-red-700 uppercase'>Descripción</p>
          <div className='font-pt-mono border-2 border-red-700 bg-transparent px-3 py-1.5 text-sm whitespace-pre-wrap text-black'>
            {bio}
          </div>
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
 * Clipboard / polaroid card shown in the top-left.
 *
 * Composes three formulario-shared assets stacked vertically with the
 * same approach as `ProfilePhoto`:
 *   - `broche.png`     — the binder clip / clothespin on top
 *   - `marco-foto.png` — the photo frame underneath
 *   - the user's photo cropped inside the frame (fallback to initials)
 */
function PolaroidCard({ photoUrl, displayName }: PolaroidCardProps) {
  return (
    <div className='relative w-36 sm:w-44 lg:w-48'>
      {/* marco (233×291) + photo slot */}
      <div
        className='relative w-full'
        style={{ aspectRatio: '233 / 291' }}
      >
        <Image
          src='/assets/private-profile/marco.png'
          alt=''
          fill
          className='object-fill'
          priority
        />
        {/* Photo sits inside the white area between the two red stripes.
        <div className='absolute top-[10%] right-[2%] bottom-[13%] overflow-hidden'>
            Top stripe ≈ 13%, bottom stripe ≈ 12% of the marco height. */}
        <div className='absolute top-[10%] right-[2%] bottom-[12%] left-[0%] overflow-hidden'>
          {photoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={photoUrl}
              alt={displayName}
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-[#e8b4a8]'>
              <span className='font-baby-doll text-4xl font-bold text-black/40 uppercase'>
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* broche — absolute on the marco, top-left, wire arms floating above.
            Negative top pushes the arms above the red stripe. */}
        <div
          className='absolute left-0 z-10'
          style={{ top: '35%', width: '53%', left: '-22%' }}
        >
          <Image
            src='/assets/private-profile/broche.png'
            alt=''
            width={123}
            height={93}
            className='h-auto w-full'
            priority
          />
        </div>
      </div>
    </div>
  )
}

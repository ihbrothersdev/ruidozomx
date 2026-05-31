import Image from 'next/image'
import { ROLE_LABELS, type Role } from '@/lib/types'
import type { EventSummary, InterestSummary, SongProposalSummary, UserProposalSummary } from './DynamicModules'
import OwnProfileActions from './OwnProfileActions'

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
}

export default function OwnProfileView({ displayName, photoUrl, role, location }: OwnProfileViewProps) {
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
            className='absolute top-4 right-4 z-10 h-10 w-auto sm:h-14 lg:right-8'
          />

          <div className='relative z-10 px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 lg:px-12 lg:pt-12 lg:pb-12'>
            {/* Header row: broche on the left + Ruidozo logo to its right */}
            <div className='mb-6 flex items-center gap-4 sm:gap-6 lg:mb-8'>
              <PolaroidCard
                photoUrl={photoUrl}
                displayName={displayName}
              />
              <Image
                src='/assets/logo.png'
                alt='Ruidozo'
                width={380}
                height={183}
                className='h-12 w-auto sm:h-16 lg:h-20'
                priority
              />
            </div>

            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
              {/* Left column */}
              <div className='space-y-6'>
                <DataFields
                  displayName={displayName}
                  location={location}
                  role={role}
                />

                {/* TODO: activity inbox (Recibiste una propuesta, etc.) */}
                {/* TODO: Eventos publicados */}
              </div>

              {/* Right column */}
              <div className='space-y-6'>
                <OwnProfileActions />

                {/* TODO: Datos del venue (editable) */}
                {/* TODO: Convocatorias */}
                {/* TODO: Propuestas recibidas */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Subcomponents ─────────────────────────────────────────────────────── */

interface DataFieldsProps {
  displayName: string
  location: string
  role: Role | null
}

/**
 * Read-only "form-style" block showing the user's base data:
 * Nombre/Alias, Ciudad/País, Rol. Each field is a label + a red-bordered
 * box containing the value. Display only — actual editing happens in
 * `/perfil/editar` (TODO).
 */
function DataFields({ displayName, location, role }: DataFieldsProps) {
  const fields: { label: string; value: string }[] = [
    { label: 'Nombre/Alias/Proyecto/Marca', value: displayName },
    { label: 'Ciudad / País', value: location || '—' },
    { label: 'Rol', value: role ? ROLE_LABELS[role] : '—' }
  ]

  return (
    <div className='space-y-3'>
      {fields.map(f => (
        <div
          key={f.label}
          className='space-y-1'
        >
          <p className='font-pt-mono text-xs font-bold tracking-wider text-red-600 uppercase'>{f.label}</p>
          <div className='font-pt-mono border-2 border-red-600 bg-transparent px-3 py-1.5 text-sm tracking-wider text-black uppercase'>
            {f.value}
          </div>
        </div>
      ))}
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
    <div
      className='relative w-40 sm:w-48'
      // broche-img.png is 277×291 — keep that aspect so the slot maths are stable.
      style={{ aspectRatio: '277 / 291' }}
    >
      {/* Frame: includes the binder clip on top + the polaroid frame around the photo */}
      <Image
        src='/assets/private-profile/broche-img.png'
        alt=''
        fill
        className='object-contain'
        priority
      />

      {/* Photo slot — sits below the clip and inside the photo frame.
          Tuned to broche-img.png; nudge if the asset changes. */}
      <div className='absolute inset-x-[12%] top-[28%] bottom-[10%] overflow-hidden'>
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
    </div>
  )
}

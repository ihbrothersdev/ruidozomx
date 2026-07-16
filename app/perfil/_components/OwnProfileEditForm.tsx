'use client'

import { CalendarDays } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { AdminButton, EmptyState, Notice, PageHeader, Paper, SectionHeading } from '@/app/admin/_components/kit'
import type { FeaturedSongView, Role } from '@/lib/types'
import { updateOwnProfile } from '../actions'
import FeaturedSongsEditor from './FeaturedSongsEditor'
import ComparteTuEventoModal from './ComparteTuEventoModal'
import type { EventSummary } from './DynamicModules'
import IdentityBlock from './IdentityBlock'
import LinksSection from './LinksSection'
import { resizeAndEncodePhoto } from './photo-utils'
import ProfilePhoto from './ProfilePhoto'
import ReviewSection from './ReviewSection'

/** Serialize the editor's ordered keys (`type:id`) into the form payload. */
function serializeFeatured(keys: string[]): string {
  return JSON.stringify(
    keys.map(key => {
      const idx = key.indexOf(':')
      return { type: key.slice(0, idx), id: key.slice(idx + 1) }
    })
  )
}

interface OwnProfileEditFormProps {
  displayName: string
  role: Role | null
  location: string
  photoUrl: string | null
  contact: string | null
  socialLinks: Record<string, string> | null
  roleProfile: Record<string, unknown> | null
  bio?: string
  country?: string
  state?: string
  city?: string
  /** Band only: rolas the band can feature (proposals + cassette tracks). */
  featuredCandidates?: FeaturedSongView[]
  /** Band only: currently featured `type:id` keys, in order. */
  featuredSelected?: string[]
  /** Published events — bands can edit each one inline from here. */
  events?: EventSummary[]
  /** Called after a successful save or cancel — host swaps back to the dashboard. */
  onExitEdit: () => void
}

const INDUSTRY_ROLES: Role[] = ['manager', 'promotor', 'agente']

/**
 * Inline edit form for the private profile. Renders on the Mesa de Control
 * paper shell and turns the user's data into editable fields using the same
 * building blocks the public ProfileView uses (ProfilePhoto, IdentityBlock,
 * ReviewSection, LinksSection). Saving goes through `updateOwnProfile`; the
 * role itself is locked server-side (only industry sub-roles can switch via
 * `role_type`).
 */
export default function OwnProfileEditForm(props: OwnProfileEditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState(props.displayName)
  const [bio, setBio] = useState(props.bio ?? '')
  const [contact, setContact] = useState(props.contact ?? '')
  const [country, setCountry] = useState(props.country ?? '')
  const [stateField, setStateField] = useState(props.state ?? '')
  const [city, setCity] = useState(props.city ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(props.photoUrl)
  const [photoData, setPhotoData] = useState<string>('')
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(() => ({ ...(props.socialLinks ?? {}) }))
  const [roleState, setRoleState] = useState<Record<string, unknown>>(() => ({ ...(props.roleProfile ?? {}) }))
  const [activeRole, setActiveRole] = useState<Role | null>(props.role)
  const [featured, setFeatured] = useState<string[]>(props.featuredSelected ?? [])
  const [editingEvent, setEditingEvent] = useState<EventSummary | null>(null)

  const events = props.events ?? []
  const canEditEvents = props.role === 'banda'

  function updateRoleField(key: string, value: unknown) {
    setRoleState(prev => ({ ...prev, [key]: value }))
  }

  async function handlePhotoSelected(file: File) {
    try {
      const dataUrl = await resizeAndEncodePhoto(file)
      setPhotoPreview(dataUrl)
      setPhotoData(dataUrl)
    } catch {
      setError('No se pudo procesar la imagen. Intenta con otra foto.')
    }
  }

  function handleSave() {
    setError(null)
    const fd = new FormData()
    fd.set('display_name', displayName)
    fd.set('bio', bio)
    fd.set('contact', contact)
    fd.set('country', country)
    fd.set('state', stateField)
    fd.set('city', city)
    if (photoData) fd.set('photo_data', photoData)

    for (const [platform, url] of Object.entries(socialLinks)) {
      if (url.trim()) fd.set(`social_${platform}`, url)
    }

    if (props.role && INDUSTRY_ROLES.includes(props.role) && activeRole) {
      fd.set('role_type', activeRole)
    }

    if (props.role === 'banda') {
      fd.set('featured_songs', serializeFeatured(featured))
    }

    for (const [key, value] of Object.entries(roleState)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          fd.append(key, String(item))
        }
      } else if (typeof value === 'boolean') {
        fd.set(key, value ? 'true' : '')
      } else if (value != null) {
        fd.set(key, String(value))
      }
    }

    startTransition(async () => {
      const result = await updateOwnProfile(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        router.refresh()
        props.onExitEdit()
      }
    })
  }

  return (
    <div className='admin-root relative min-h-screen'>
      <div
        aria-hidden
        className='pointer-events-none fixed inset-0 z-0 opacity-[0.12] mix-blend-multiply'
        style={{ backgroundImage: "url('/assets/membrete-background.png')", backgroundSize: 'cover' }}
      />

      <div className='relative z-10 mx-auto max-w-2xl px-4 py-8'>
        <PageHeader
          eyebrow='Ficha propia'
          title='Editar perfil'
        />

        <div className='mt-8 space-y-6'>
          {/* Photo + identity */}
          <Paper className='flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start sm:p-6'>
            <ProfilePhoto
              photoUrl={photoPreview}
              displayName={displayName}
              editable
              onPhotoSelected={handlePhotoSelected}
            />
            <IdentityBlock
              role={activeRole}
              displayName={displayName}
              location={props.location}
              roleProfile={roleState}
              editing
              country={country}
              state={stateField}
              city={city}
              onDisplayNameChange={setDisplayName}
              onCountryChange={setCountry}
              onStateChange={setStateField}
              onCityChange={setCity}
              onRoleFieldChange={updateRoleField}
              onRoleChange={setActiveRole}
            />
          </Paper>

          <ReviewSection
            bio={bio}
            role={activeRole}
            editing
            onBioChange={setBio}
          />

          <LinksSection
            socialLinks={socialLinks}
            contact={contact}
            role={activeRole}
            editing
            variant='private'
            onSocialLinksChange={setSocialLinks}
            onContactChange={setContact}
          />

          {props.role === 'banda' && (
            <FeaturedSongsEditor
              candidates={props.featuredCandidates ?? []}
              selected={featured}
              onChange={setFeatured}
            />
          )}

          {canEditEvents && (
            <div>
              <SectionHeading
                icon={CalendarDays}
                title='Eventos publicados'
              />

              {events.length === 0 ? (
                <EmptyState icon={CalendarDays}>Aún no publicas eventos</EmptyState>
              ) : (
                <div className='space-y-2'>
                  {events.map(ev => {
                    const dateLabel = new Date(`${ev.event_date}T00:00:00`).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                    return (
                      <Paper
                        key={ev.id}
                        flat
                        className='flex items-center justify-between gap-3 px-3 py-2'
                      >
                        <div className='font-pt-mono min-w-0 text-sm text-admin-ink uppercase'>
                          <span className='font-bold'>{ev.title}</span>
                          <span className='text-admin-ink-faint'> · {dateLabel}</span>
                          {ev.city && <span className='text-admin-ink-faint'> · {ev.city}</span>}
                        </div>
                        <AdminButton
                          type='button'
                          variant='solid'
                          size='sm'
                          onClick={() => setEditingEvent(ev)}
                        >
                          Editar
                        </AdminButton>
                      </Paper>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Save / Cancel */}
          <div className='flex flex-col items-center gap-3 pt-2'>
            <div className='flex w-full max-w-70 gap-2'>
              <AdminButton
                type='button'
                variant='primary'
                size='lg'
                onClick={handleSave}
                disabled={isPending}
                className='flex-1'
              >
                {isPending ? 'Guardando…' : 'Guardar'}
              </AdminButton>
              <AdminButton
                type='button'
                variant='solid'
                size='lg'
                onClick={props.onExitEdit}
                disabled={isPending}
                className='flex-1'
              >
                Cancelar
              </AdminButton>
            </div>
            {error && (
              <Notice
                tone='red'
                className='w-full max-w-70'
              >
                {error}
              </Notice>
            )}
          </div>
        </div>
      </div>

      {canEditEvents && (
        <ComparteTuEventoModal
          key={editingEvent?.id ?? 'none'}
          open={!!editingEvent}
          onOpenChange={open => {
            if (!open) setEditingEvent(null)
          }}
          event={editingEvent}
        />
      )}
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { Role } from '@/lib/types'
import { updateOwnProfile } from '../actions'
import ComparteTuEventoModal from './ComparteTuEventoModal'
import type { EventSummary } from './DynamicModules'
import IdentityBlock from './IdentityBlock'
import LinksSection from './LinksSection'
import { resizeAndEncodePhoto } from './photo-utils'
import ProfilePhoto from './ProfilePhoto'
import ReviewSection from './ReviewSection'

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
  /** Published events — bands can edit each one inline from here. */
  events?: EventSummary[]
  /** Called after a successful save or cancel — host swaps back to the dashboard. */
  onExitEdit: () => void
}

const INDUSTRY_ROLES: Role[] = ['manager', 'promotor', 'agente']

/**
 * Inline edit form for the private profile. Keeps the red-folder dashboard
 * shell (red background + grey folder + logo) and turns the user's data into
 * editable fields using the same building blocks the public ProfileView uses
 * (ProfilePhoto, IdentityBlock, ReviewSection, LinksSection). Saving goes
 * through `updateOwnProfile`; the role itself is locked server-side (only
 * industry sub-roles can switch via `role_type`).
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
    <div className='relative min-h-screen overflow-hidden'>
      {/* Full-screen red background — same asset as the dashboard. */}
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
          {/* Desktop: rectangular grey texture with a FIXED-height tab cut at the
              top-right (clip-path, px not %), so the notch doesn't stretch as the
              form grows and content never lands on the cut. */}
          <div
            className='absolute inset-0 hidden lg:block'
            style={{ clipPath: 'polygon(0 0, 50% 0, 50% 64px, 100% 64px, 100% 100%, 0 100%)' }}
          >
            <Image
              src='/assets/registro/formulario/shared/folder-grey-back-mobile.png'
              alt=''
              fill
              className='object-cover'
            />
          </div>

          {/* Top decoration: rayo on the right corner */}
          <Image
            src='/assets/registro/formulario/shared/rayo.png'
            alt=''
            width={80}
            height={120}
            className='absolute right-3 z-10 h-10 w-auto'
          />

          <div className='relative z-10 px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 lg:px-12 lg:pt-12 lg:pb-12'>
            {/* Header row: logo */}
            <div className='mb-6 flex items-center justify-between gap-4 lg:mb-8'>
              <h1 className='font-pt-mono text-xl font-bold tracking-wider text-red-700 uppercase sm:text-2xl'>
                Editar perfil
              </h1>
            </div>

            <div className='space-y-6'>
              {/* Photo + identity */}
              <div className='group flex flex-col items-center gap-5 sm:flex-row sm:items-start'>
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
              </div>

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

              {canEditEvents && (
                <div className='space-y-2'>
                  <p className='font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'>
                    Eventos publicados
                  </p>

                  {events.length === 0 ? (
                    <div className='font-pt-mono border-2 border-red-700 px-3 py-1.5 text-sm tracking-wider text-black/60 uppercase'>
                      Aún no publicas eventos
                    </div>
                  ) : (
                    <ul className='space-y-2'>
                      {events.map(ev => {
                        const dateLabel = new Date(`${ev.event_date}T00:00:00`).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                        return (
                          <li
                            key={ev.id}
                            className='flex items-center justify-between gap-3 border-2 border-red-700 px-3 py-1.5'
                          >
                            <div className='font-pt-mono min-w-0 text-sm text-black uppercase'>
                              <span className='font-bold'>{ev.title}</span>
                              <span className='text-black/60'> · {dateLabel}</span>
                              {ev.city && <span className='text-black/60'> · {ev.city}</span>}
                            </div>
                            <button
                              type='button'
                              onClick={() => setEditingEvent(ev)}
                              className='font-pt-mono shrink-0 cursor-pointer bg-black px-3 py-1 text-xs font-bold tracking-wider text-white uppercase transition-opacity hover:opacity-80 active:scale-95'
                            >
                              Editar
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )}

              {/* Save / Cancel */}
              <div className='flex flex-col items-center gap-3 pt-2'>
                <div className='flex w-full max-w-70 gap-2'>
                  <button
                    type='button'
                    onClick={handleSave}
                    disabled={isPending}
                    className='font-impact-label flex-1 cursor-pointer border-red-700 bg-red-600 px-3 py-1 text-center text-xl font-bold tracking-wider text-white uppercase transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isPending ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button
                    type='button'
                    onClick={props.onExitEdit}
                    disabled={isPending}
                    className='font-impact-label flex-1 cursor-pointer border-black bg-black px-3 py-1 text-center text-xl font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    Cancelar
                  </button>
                </div>
                {error && (
                  <p className='font-pt-mono w-full max-w-70 bg-red-600/10 px-3 py-2 text-xs font-bold tracking-wider text-red-700 uppercase'>
                    {error}
                  </p>
                )}
              </div>
            </div>
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

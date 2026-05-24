'use client'

import BackHomeNav from '@/app/components/layout/BackHomeNav'
import type { Role } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { confirmUserEmailAsAdmin, deleteProfileAsAdmin, updateOwnProfile, updateProfileAsAdmin } from '../actions'
import ActionButtons from './ActionButtons'
import DynamicModules, { type EventSummary, type SongProposalSummary } from './DynamicModules'
import IdentityBlock from './IdentityBlock'
import LinksSection from './LinksSection'
import { resizeAndEncodePhoto } from './photo-utils'
import ProfileLayout from './ProfileLayout'
import ProfilePhoto from './ProfilePhoto'
import ReviewSection from './ReviewSection'
import UltimaActividad from './UltimaActividad'

export interface ProfileViewProps {
  profileId?: string
  displayName: string
  role: Role | null
  /** Pre-joined "City, Country" — used in display mode. */
  location: string
  photoUrl: string | null
  contact: string | null
  socialLinks: Record<string, string> | null
  roleProfile: Record<string, unknown> | null
  isOwnProfile: boolean
  isLoggedIn: boolean
  acceptProposals: boolean
  bio?: string
  alreadySent?: { proposal: boolean; sendInterest: boolean }
  songProposals?: SongProposalSummary[]
  songProposalsCount?: number
  events?: EventSummary[]
  lastActivityAt: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  isAdmin?: boolean
  /** Has the profile owner confirmed their email? Drives the admin
   *  "Confirmar cuenta" affordance — visible only when false. */
  isUserConfirmed?: boolean
}

const INDUSTRY_ROLES: Role[] = ['manager', 'promotor', 'agente']

export default function ProfileView(props: ProfileViewProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
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

  function resetState() {
    setDisplayName(props.displayName)
    setBio(props.bio ?? '')
    setContact(props.contact ?? '')
    setCountry(props.country ?? '')
    setStateField(props.state ?? '')
    setCity(props.city ?? '')
    setPhotoPreview(props.photoUrl)
    setPhotoData('')
    setSocialLinks({ ...(props.socialLinks ?? {}) })
    setRoleState({ ...(props.roleProfile ?? {}) })
    setActiveRole(props.role)
    setError(null)
  }

  function startEdit() {
    setError(null)
    setIsEditing(true)
  }

  function cancelEdit() {
    resetState()
    setIsEditing(false)
  }

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
      const result =
        props.isOwnProfile || !props.profileId
          ? await updateOwnProfile(fd)
          : await updateProfileAsAdmin(props.profileId, fd)
      if (result?.error) {
        setError(result.error)
      } else {
        setIsEditing(false)
        router.refresh()
      }
    })
  }

  function handleDelete() {
    if (!props.profileId) return
    const ok = window.confirm(
      `¿Eliminar el perfil de "${props.displayName}"? Se marcará como inactivo (no se borran datos).`
    )
    if (!ok) return
    setError(null)
    startTransition(async () => {
      const result = await deleteProfileAsAdmin(props.profileId!)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/comunidad')
      }
    })
  }

  function handleConfirmEmail() {
    if (!props.profileId) return
    const ok = window.confirm(`¿Confirmar la cuenta de "${props.displayName}"?`)
    if (!ok) return
    setError(null)
    startTransition(async () => {
      const result = await confirmUserEmailAsAdmin(props.profileId!)
      if (result?.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  const canEdit = props.isOwnProfile || Boolean(props.isAdmin && props.profileId)
  const canDelete = Boolean(props.isAdmin && !props.isOwnProfile && props.profileId)
  const canConfirm = Boolean(
    props.isAdmin && !props.isOwnProfile && props.profileId && props.isUserConfirmed === false
  )

  const shownPhoto = isEditing ? photoPreview : props.photoUrl
  const shownDisplayName = isEditing ? displayName : props.displayName
  const shownBio = isEditing ? bio : props.bio
  const shownContact = isEditing ? contact : props.contact
  const shownSocialLinks = isEditing ? socialLinks : props.socialLinks
  const shownRoleProfile = isEditing ? roleState : props.roleProfile
  const shownRole = isEditing ? activeRole : props.role

  const showAdminActions =
    Boolean(props.isAdmin) && !props.isOwnProfile && !isEditing && (canEdit || canDelete || canConfirm)

  return (
    <ProfileLayout
      floatingNav={<BackHomeNav />}
      leftColumn={
        <>
          <div
            className={
              isEditing
                ? 'flex flex-col items-center gap-5 sm:flex-row sm:items-start'
                : 'flex items-center gap-5'
            }
          >
            <ProfilePhoto
              photoUrl={shownPhoto}
              displayName={shownDisplayName}
              editable={isEditing}
              onPhotoSelected={handlePhotoSelected}
            />
            <IdentityBlock
              role={shownRole}
              displayName={shownDisplayName}
              location={props.location}
              roleProfile={shownRoleProfile}
              editing={isEditing}
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
            bio={shownBio}
            role={shownRole}
            editing={isEditing}
            onBioChange={setBio}
          />
        </>
      }
      rightColumn={
        <>
          {props.role && (
            <DynamicModules
              role={props.role}
              roleProfile={props.roleProfile}
              songProposals={props.songProposals}
              songProposalsCount={props.songProposalsCount}
              events={props.events}
            />
          )}

          <LinksSection
            socialLinks={shownSocialLinks}
            contact={shownContact}
            role={shownRole}
            editing={isEditing}
            onSocialLinksChange={setSocialLinks}
            onContactChange={setContact}
          />

          <ActionButtons
            profileId={props.profileId}
            isOwnProfile={props.isOwnProfile}
            isLoggedIn={props.isLoggedIn}
            role={shownRole}
            acceptProposals={props.acceptProposals}
            displayName={shownDisplayName}
            alreadySent={props.alreadySent}
            editing={isEditing}
          />
        </>
      }
      bottomSection={
        <div className='flex flex-col items-center gap-4'>
          {isEditing ? (
            <>
              <div className='flex w-70 gap-2'>
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
                  onClick={cancelEdit}
                  disabled={isPending}
                  className='font-impact-label flex-1 cursor-pointer border-black bg-black px-3 py-1 text-center text-xl font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  Cancelar
                </button>
              </div>
              {error && (
                <p className='font-pt-mono w-70 bg-red-600/10 px-3 py-2 text-xs font-bold tracking-wider text-red-700 uppercase'>
                  {error}
                </p>
              )}
            </>
          ) : showAdminActions ? (
            <div className='flex w-70 flex-col gap-2'>
              <div className='flex gap-2'>
                {canEdit && (
                  <button
                    type='button'
                    onClick={startEdit}
                    className='font-impact-label flex-1 cursor-pointer border-black bg-black px-3 py-1 text-center text-xl font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80'
                  >
                    Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    type='button'
                    onClick={handleDelete}
                    disabled={isPending}
                    className='font-impact-label flex-1 cursor-pointer border-red-800 bg-red-700 px-3 py-1 text-center text-xl font-bold tracking-wider text-white uppercase transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    Eliminar
                  </button>
                )}
              </div>
              {canConfirm && (
                <button
                  type='button'
                  onClick={handleConfirmEmail}
                  disabled={isPending}
                  className='font-impact-label block w-full cursor-pointer border-green-800 bg-green-700 px-3 py-1 text-center text-xl font-bold tracking-wider text-white uppercase transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  Confirmar cuenta
                </button>
              )}
              {error && (
                <p className='font-pt-mono bg-red-600/10 px-3 py-2 text-xs font-bold tracking-wider text-red-700 uppercase'>
                  {error}
                </p>
              )}
            </div>
          ) : props.isOwnProfile ? (
            <button
              type='button'
              onClick={startEdit}
              className='font-impact-label block w-70 cursor-pointer border-black bg-black px-3 py-1 text-center text-xl font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80'
            >
              Editar perfil
            </button>
          ) : null}
          <UltimaActividad lastActivityAt={props.lastActivityAt ?? null} />
        </div>
      }
    />
  )
}

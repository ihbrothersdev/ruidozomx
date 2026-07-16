'use client'

import { AdminButton } from '@/app/admin/_components/kit'
import BackHomeNav from '@/app/components/layout/BackHomeNav'
import type { FeaturedSongView, Role } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  confirmUserEmailAsAdmin,
  deleteProfileAsAdmin,
  resendConfirmationEmailAsAdmin,
  updateOwnProfile,
  updateProfileAsAdmin
} from '../actions'
import ActionButtons from './ActionButtons'
import ConfirmActionModal from './ConfirmActionModal'
import DynamicModules, {
  type EventSummary,
  type InterestSummary,
  type SongProposalSummary,
  type UserProposalSummary
} from './DynamicModules'
import FeaturedSongsEditor from './FeaturedSongsEditor'
import IdentityBlock from './IdentityBlock'
import ProfileFeaturedSongs from './ProfileFeaturedSongs'
import LinksSection from './LinksSection'
import { resizeAndEncodePhoto } from './photo-utils'
import ProfileLayout from './ProfileLayout'
import ProfilePhoto from './ProfilePhoto'
import ReviewSection from './ReviewSection'
import { sileo } from 'sileo'
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
  receivedConnections?: InterestSummary[]
  receivedConnectionsCount?: number
  sentConnections?: InterestSummary[]
  sentConnectionsCount?: number
  mutualIds?: string[]
  receivedProposals?: UserProposalSummary[]
  receivedProposalsCount?: number
  sentProposals?: UserProposalSummary[]
  sentProposalsCount?: number
  lastActivityAt: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  isAdmin?: boolean
  /** Has the profile owner confirmed their email? Drives the admin
   *  "Confirmar cuenta" affordance — visible only when false. */
  isUserConfirmed?: boolean
  /** Band only: curated rolas shown publicly (with inline playback). */
  featuredSongs?: FeaturedSongView[]
  /** Band only (admin edit): pool of rolas to pick from. */
  featuredCandidates?: FeaturedSongView[]
  /** Band only (admin edit): currently featured `type:id` keys, in order. */
  featuredSelected?: string[]
}

/** Serialize the editor's ordered keys (`type:id`) into the form payload. */
function serializeFeatured(keys: string[]): string {
  return JSON.stringify(
    keys.map(key => {
      const idx = key.indexOf(':')
      return { type: key.slice(0, idx), id: key.slice(idx + 1) }
    })
  )
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
  const [featured, setFeatured] = useState<string[]>(props.featuredSelected ?? [])

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
    setFeatured(props.featuredSelected ?? [])
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

  const [adminModal, setAdminModal] = useState<'delete' | 'confirm' | null>(null)

  function runDelete() {
    if (!props.profileId) return
    setError(null)
    startTransition(async () => {
      const result = await deleteProfileAsAdmin(props.profileId!)
      if (result?.error) {
        setError(result.error)
        setAdminModal(null)
      } else {
        setAdminModal(null)
        router.push('/comunidad')
      }
    })
  }

  function runConfirmEmail() {
    if (!props.profileId) return
    setError(null)
    startTransition(async () => {
      const result = await confirmUserEmailAsAdmin(props.profileId!)
      if (result?.error) {
        setError(result.error)
        setAdminModal(null)
      } else {
        setAdminModal(null)
        router.refresh()
      }
    })
  }

  function handleResendEmail() {
    if (!props.profileId) return
    setError(null)
    startTransition(async () => {
      const result = await resendConfirmationEmailAsAdmin(props.profileId!)
      if (result?.error) {
        sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
      } else {
        sileo.success({
          title: 'Correo reenviado',
          description: `Le mandamos otra vez el correo de confirmación a ${props.displayName}.`,
          position: 'top-center',
          duration: 4000
        })
      }
    })
  }

  const canEdit = props.isOwnProfile || Boolean(props.isAdmin && props.profileId)
  const canDelete = Boolean(props.isAdmin && !props.isOwnProfile && props.profileId)
  const canConfirm = Boolean(props.isAdmin && !props.isOwnProfile && props.profileId && props.isUserConfirmed === false)

  const shownPhoto = isEditing ? photoPreview : props.photoUrl
  const shownDisplayName = isEditing ? displayName : props.displayName
  const shownBio = isEditing ? bio : props.bio
  const shownContact = isEditing ? contact : props.contact
  const shownSocialLinks = isEditing ? socialLinks : props.socialLinks
  const shownRoleProfile = isEditing ? roleState : props.roleProfile
  const shownRole = isEditing ? activeRole : props.role

  const showAdminActions =
    Boolean(props.isAdmin) && !props.isOwnProfile && !isEditing && (canEdit || canDelete || canConfirm)

  // Edit mode drops DynamicModules (read-only, would just be dead space next
  // to the dense form) and uses a single-column flow instead of two columns.
  if (isEditing) {
    return (
      <ProfileLayout
        floatingNav={<BackHomeNav />}
        singleColumn
        leftColumn={
          <>
            <div className='flex flex-col items-center gap-5 sm:flex-row sm:items-start'>
              <ProfilePhoto
                photoUrl={shownPhoto}
                displayName={shownDisplayName}
                editable
                onPhotoSelected={handlePhotoSelected}
              />
              <IdentityBlock
                role={shownRole}
                displayName={shownDisplayName}
                location={props.location}
                roleProfile={shownRoleProfile}
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
              bio={shownBio}
              role={shownRole}
              editing
              onBioChange={setBio}
            />

            <LinksSection
              socialLinks={shownSocialLinks}
              contact={shownContact}
              role={shownRole}
              editing
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
          </>
        }
        bottomSection={
          <div className='flex flex-col items-center gap-4'>
            <div className='flex w-70 gap-2'>
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
                onClick={cancelEdit}
                disabled={isPending}
                className='flex-1'
              >
                Cancelar
              </AdminButton>
            </div>
            {error && (
              <p className='font-pt-mono border-2 border-admin-ink bg-admin-red/12 w-70 px-3 py-2 text-xs font-bold tracking-wider text-admin-red uppercase'>
                {error}
              </p>
            )}
            <UltimaActividad lastActivityAt={props.lastActivityAt ?? null} />
          </div>
        }
      />
    )
  }

  return (
    <>
      <ProfileLayout
        floatingNav={<BackHomeNav />}
        leftColumn={
          <>
            <div className='flex items-center gap-5'>
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
            {props.featuredSongs && props.featuredSongs.length > 0 && props.profileId && (
              <ProfileFeaturedSongs
                songs={props.featuredSongs}
                profileId={props.profileId}
              />
            )}

            {props.role && (
              <DynamicModules
                role={props.role}
                roleProfile={props.roleProfile}
                songProposals={props.songProposals}
                songProposalsCount={props.songProposalsCount}
                events={props.events}
                receivedConnections={props.receivedConnections}
                receivedConnectionsCount={props.receivedConnectionsCount}
                sentConnections={props.sentConnections}
                sentConnectionsCount={props.sentConnectionsCount}
                mutualIds={props.mutualIds}
                receivedProposals={props.receivedProposals}
                receivedProposalsCount={props.receivedProposalsCount}
                sentProposals={props.sentProposals}
                sentProposalsCount={props.sentProposalsCount}
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
            {showAdminActions ? (
              <div className='flex w-70 flex-col gap-2'>
                <div className='flex gap-2'>
                  {canEdit && (
                    <AdminButton
                      type='button'
                      variant='solid'
                      size='lg'
                      onClick={startEdit}
                      className='flex-1'
                    >
                      Editar
                    </AdminButton>
                  )}
                  {canDelete && (
                    <AdminButton
                      type='button'
                      variant='primary'
                      size='lg'
                      onClick={() => setAdminModal('delete')}
                      disabled={isPending}
                      className='flex-1'
                    >
                      Eliminar
                    </AdminButton>
                  )}
                </div>
                {canConfirm && (
                  <div className='flex flex-col gap-2'>
                    <AdminButton
                      type='button'
                      variant='outline'
                      size='lg'
                      onClick={() => setAdminModal('confirm')}
                      disabled={isPending}
                      className='w-full'
                    >
                      Confirmar cuenta
                    </AdminButton>
                    <AdminButton
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={handleResendEmail}
                      disabled={isPending}
                      className='text-admin-ink-soft w-full'
                    >
                      O reenviar correo de confirmación
                    </AdminButton>
                  </div>
                )}
                {error && (
                  <p className='font-pt-mono border-2 border-admin-ink bg-admin-red/12 px-3 py-2 text-xs font-bold tracking-wider text-admin-red uppercase'>
                    {error}
                  </p>
                )}
              </div>
            ) : props.isOwnProfile ? (
              <AdminButton
                type='button'
                variant='solid'
                size='lg'
                onClick={startEdit}
                className='w-70'
              >
                Editar perfil
              </AdminButton>
            ) : null}
            <UltimaActividad lastActivityAt={props.lastActivityAt ?? null} />
          </div>
        }
      />

      <ConfirmActionModal
        open={adminModal === 'delete'}
        onOpenChange={open => setAdminModal(open ? 'delete' : null)}
        title='Eliminar perfil'
        message={`Vas a marcar el perfil de "${props.displayName}" como inactivo. No se borran datos — se puede revertir desde la DB.`}
        confirmLabel='Eliminar'
        variant='destructive'
        isPending={isPending}
        onConfirm={runDelete}
      />
      <ConfirmActionModal
        open={adminModal === 'confirm'}
        onOpenChange={open => setAdminModal(open ? 'confirm' : null)}
        title='Confirmar cuenta'
        message={`Vas a marcar el email de "${props.displayName}" como confirmado sin necesidad de que clickeen el link. El usuario podrá iniciar sesión inmediatamente.`}
        confirmLabel='Confirmar'
        isPending={isPending}
        onConfirm={runConfirmEmail}
      />
    </>
  )
}

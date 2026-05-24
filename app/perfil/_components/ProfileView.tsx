'use client'

import BackHomeNav from '@/app/components/layout/BackHomeNav'
import type { Role } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { updateOwnProfile } from '../actions'
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
  /** Editable raw bits — required when isOwnProfile is true. */
  country?: string | null
  state?: string | null
  city?: string | null
}

const INDUSTRY_ROLES: Role[] = ['manager', 'promotor', 'agente']

export default function ProfileView(props: ProfileViewProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // ── Editable state, initialised from props ─────────────────────────────
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

    // Industry sub-role (only if the original role is an industry role).
    if (props.role && INDUSTRY_ROLES.includes(props.role) && activeRole) {
      fd.set('role_type', activeRole)
    }

    // Role-specific fields. Booleans → 'true' / ''; arrays → repeated fields.
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
        setIsEditing(false)
        // RSC refresh picks up updated props next render.
        router.refresh()
      }
    })
  }

  // Display-mode values come from props; edit-mode values come from local state.
  const shownPhoto = isEditing ? photoPreview : props.photoUrl
  const shownDisplayName = isEditing ? displayName : props.displayName
  const shownBio = isEditing ? bio : props.bio
  const shownContact = isEditing ? contact : props.contact
  const shownSocialLinks = isEditing ? socialLinks : props.socialLinks
  const shownRoleProfile = isEditing ? roleState : props.roleProfile
  const shownRole = isEditing ? activeRole : props.role

  return (
    <ProfileLayout
      floatingNav={<BackHomeNav />}
      leftColumn={
        <>
          {/* Photo + Identity */}
          <div className={'flex gap-5 ' + (isEditing ? 'items-start' : 'items-center')}>
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

          {/* Review / Description */}
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
          {/* Dynamic modules — always read from the persisted props so they
              don't fluctuate while the user is editing chips. */}
          {props.role && (
            <DynamicModules
              role={props.role}
              roleProfile={props.roleProfile}
              songProposals={props.songProposals}
              songProposalsCount={props.songProposalsCount}
              events={props.events}
            />
          )}

          {/* Links */}
          <LinksSection
            socialLinks={shownSocialLinks}
            contact={shownContact}
            role={shownRole}
            editing={isEditing}
            onSocialLinksChange={setSocialLinks}
            onContactChange={setContact}
          />

          {/* Action buttons / Save+Cancel */}
          <ActionButtons
            profileId={props.profileId}
            isOwnProfile={props.isOwnProfile}
            isLoggedIn={props.isLoggedIn}
            role={shownRole}
            acceptProposals={props.acceptProposals}
            displayName={shownDisplayName}
            alreadySent={props.alreadySent}
            onEdit={props.isOwnProfile ? startEdit : undefined}
            editing={isEditing}
            isPending={isPending}
            saveError={error}
            onSave={handleSave}
            onCancel={cancelEdit}
          />

          <UltimaActividad lastActivityAt={props.lastActivityAt ?? null} />
        </>
      }
    />
  )
}

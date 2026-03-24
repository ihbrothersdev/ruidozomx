import type { Role } from '@/lib/types'
import ActionButtons from './ActionButtons'
import DynamicModules from './DynamicModules'
import IdentityBlock from './IdentityBlock'
import LinksSection from './LinksSection'
import ProfileChips from './ProfileChips'
import ProfileLayout from './ProfileLayout'
import ProfilePhoto from './ProfilePhoto'
import ReviewSection from './ReviewSection'
import UltimaActividad from './UltimaActividad'

export interface ProfileViewProps {
  displayName: string
  role: Role | null
  location: string
  photoUrl: string | null
  socialLinks: Record<string, string> | null
  roleProfile: Record<string, any> | null
  isOwnProfile: boolean
  acceptProposals: boolean
}

export default function ProfileView({
  displayName,
  role,
  location,
  photoUrl,
  socialLinks,
  roleProfile,
  isOwnProfile,
  acceptProposals
}: ProfileViewProps) {
  return (
    <ProfileLayout
      leftColumn={
        <>
          {/* Photo + Identity */}
          <div className='flex items-start gap-5'>
            <ProfilePhoto
              photoUrl={photoUrl}
              displayName={displayName}
            />
            <IdentityBlock
              role={role}
              displayName={displayName}
              location={location}
              roleProfile={roleProfile}
            />
          </div>

          {/* Chips */}
          {role && roleProfile && (
            <ProfileChips
              role={role}
              roleProfile={roleProfile}
            />
          )}

          {/* Review / Description */}
          {roleProfile && (
            <ReviewSection
              review={(roleProfile.review as string) || null}
              description={(roleProfile.description as string) || null}
            />
          )}
        </>
      }
      rightColumn={
        <>
          {/* Dynamic modules */}
          {role && <DynamicModules role={role} />}

          {/* Links */}
          {role && roleProfile && (
            <LinksSection
              role={role}
              roleProfile={roleProfile}
              socialLinks={socialLinks}
            />
          )}

          {/* Action buttons */}
          <ActionButtons
            isOwnProfile={isOwnProfile}
            role={role}
            acceptProposals={acceptProposals}
          />
        </>
      }
      bottomSection={<UltimaActividad />}
    />
  )
}

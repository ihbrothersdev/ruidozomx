import Image from 'next/image'
import type { Role } from '@/lib/types'
import ActionButtons from './ActionButtons'
import DynamicModules from './DynamicModules'
import IdentityBlock from './IdentityBlock'
import LinksSection from './LinksSection'
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
  isLoggedIn: boolean
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
  isLoggedIn,
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
          {/* Logo + hand decoration */}
          <div className='flex items-center gap-2'>
            <Image
              src='/assets/registro/explicacion-rol/shared/mano.png'
              alt=''
              width={80}
              height={80}
              className='h-17 w-auto'
              unoptimized
            />
            <Image
              src='/assets/logo.png'
              alt='Ruidozo'
              width={380}
              height={183}
              className='h-40 w-auto'
              unoptimized
            />
          </div>

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
            isLoggedIn={isLoggedIn}
            role={role}
            acceptProposals={acceptProposals}
          />
        </>
      }
      bottomSection={<UltimaActividad />}
    />
  )
}

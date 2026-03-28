import Image from 'next/image'
import Link from 'next/link'
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
  contact: string | null
  socialLinks: Record<string, string> | null
  roleProfile: Record<string, any> | null
  isOwnProfile: boolean
  isLoggedIn: boolean
  acceptProposals: boolean
  bio?: string
}

export default function ProfileView({
  displayName,
  role,
  location,
  photoUrl,
  contact,
  socialLinks,
  roleProfile,
  isOwnProfile,
  isLoggedIn,
  acceptProposals,
  bio
}: ProfileViewProps) {
  const logoDecoration = (
    <div className='flex items-center gap-2'>
      <Image
        src='/assets/registro/explicacion-rol/shared/mano.png'
        alt=''
        width={80}
        height={80}
        className='h-17 w-auto'
        unoptimized
      />
      <Link href='/'>
        <Image
          src='/assets/logo.png'
          alt='Ruidozo'
          width={380}
          height={183}
          className='h-40 w-auto'
          unoptimized
        />
      </Link>
    </div>
  )

  return (
    <ProfileLayout
      topDecoration={logoDecoration}
      leftColumn={
        <>
          {/* Photo + Identity */}
          <div className='flex items-center gap-5'>
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
          <ReviewSection bio={bio} />
        </>
      }
      rightColumn={
        <>
          {/* Logo + hand decoration — hidden on mobile (shown via topDecoration) */}
          <div className='hidden items-center gap-2 lg:flex'>
            <Image
              src='/assets/registro/explicacion-rol/shared/mano.png'
              alt=''
              width={80}
              height={80}
              className='h-17 w-auto'
              unoptimized
            />
            <Link href='/'>
              <Image
                src='/assets/logo.png'
                alt='Ruidozo'
                width={380}
                height={183}
                className='h-40 w-auto'
                unoptimized
              />
            </Link>
          </div>

          {/* Dynamic modules */}
          {role && (
            <DynamicModules
              role={role}
              roleProfile={roleProfile}
            />
          )}

          {/* Links */}
          <LinksSection
            socialLinks={socialLinks}
            contact={contact}
          />

          {/* Action buttons */}
          <ActionButtons
            isOwnProfile={isOwnProfile}
            isLoggedIn={isLoggedIn}
            role={role}
            acceptProposals={acceptProposals}
            displayName={displayName}
          />
        </>
      }
      bottomSection={<UltimaActividad />}
    />
  )
}

import Image from 'next/image'
import Link from 'next/link'
import type { Role } from '@/lib/types'
import BackHomeNav from '@/app/components/layout/BackHomeNav'
import ActionButtons from './ActionButtons'
import DynamicModules, { type EventSummary, type SongProposalSummary } from './DynamicModules'
import IdentityBlock from './IdentityBlock'
import LinksSection from './LinksSection'
import ProfileLayout from './ProfileLayout'
import ProfilePhoto from './ProfilePhoto'
import ReviewSection from './ReviewSection'
import UltimaActividad from './UltimaActividad'

export interface ProfileViewProps {
  profileId?: string
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
  alreadySent?: { proposal: boolean; sendInterest: boolean }
  songProposals?: SongProposalSummary[]
  songProposalsCount?: number
  events?: EventSummary[]
  lastActivityAt: string | null
}

export default function ProfileView({
  profileId,
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
  bio,
  alreadySent,
  songProposals,
  songProposalsCount,
  events,
  lastActivityAt
}: ProfileViewProps) {
  // const logoDecoration = (
  //   <div className='flex items-center justify-center gap-2'>
  //     <Image
  //       src='/assets/registro/explicacion-rol/shared/mano.png'
  //       alt=''
  //       width={80}
  //       height={80}
  //       className='h-10 w-auto sm:h-17'
  //       unoptimized
  //     />
  //     <Link href='/'>
  //       <Image
  //         src='/assets/logo.png'
  //         alt='Ruidozo'
  //         width={380}
  //         height={183}
  //         className='h-24 w-auto sm:h-40'
  //         unoptimized
  //       />
  //     </Link>
  //   </div>
  // )

  return (
    <ProfileLayout
      floatingNav={<BackHomeNav />}
      // topDecoration={logoDecoration}
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
          {/* <div className='hidden items-center gap-2 lg:flex'>
            <Image
              src='/assets/registro/explicacion-rol/shared/mano.png'
              alt=''
              width={80}
              height={80}
              className='h-17 w-auto'
            />
            <Link href='/'>
              <Image
                src='/assets/logo.png'
                alt='Ruidozo'
                width={380}
                height={183}
                className='h-40 w-auto'
              />
            </Link>
          </div> */}

          {/* Dynamic modules */}
          {role && (
            <DynamicModules
              role={role}
              roleProfile={roleProfile}
              songProposals={songProposals}
              songProposalsCount={songProposalsCount}
              events={events}
            />
          )}

          {/* Links */}
          <LinksSection
            socialLinks={socialLinks}
            contact={contact}
            role={role}
          />

          {/* Action buttons */}
          <ActionButtons
            profileId={profileId}
            isOwnProfile={isOwnProfile}
            isLoggedIn={isLoggedIn}
            role={role}
            acceptProposals={acceptProposals}
            displayName={displayName}
            alreadySent={alreadySent}
          />

          {/* Última actividad — directly under the action buttons */}
          <UltimaActividad lastActivityAt={lastActivityAt ?? null} />
        </>
      }
    />
  )
}

'use client'

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import type { CommunityProfile } from '../types'

const ROLE_LABELS: Record<string, string> = {
  banda: 'Banda',
  fan: 'Fan',
  venue: 'Foro/Venue',
  promotor: 'Promotor',
  manager: 'Manager',
  agente: 'Agente',
  proveedor: 'Proveedor'
}

interface ProfileCardProps {
  profile: CommunityProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const location = [profile.city, profile.country].filter(Boolean).join(', ')

  return (
    <Link
      href={`/perfil/${profile.slug}`}
      className='group relative flex h-full flex-col items-center transition-transform hover:scale-[1.02]'
    >
      <div className='relative flex h-full w-full flex-col overflow-hidden border-2 border-black/10 bg-[#e8e2d6] shadow-md'>
        <div className='relative mx-auto mt-3 aspect-[4/5] w-[85%] overflow-hidden bg-[#e8b4a8]'>
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.display_name}
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <span className='font-baby-doll text-4xl font-bold text-black/20 uppercase'>
                {profile.display_name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className='flex flex-1 flex-col items-center gap-0.5 px-3 pt-3 pb-2 text-center'>
          <h3 className='font-baby-doll text-base leading-tight font-bold text-black uppercase md:text-lg'>
            {profile.display_name}
          </h3>
          <p className='font-pt-mono text-[0.65rem] leading-tight text-black/60 uppercase md:text-xs'>{location}</p>
          <p className='font-pt-mono text-[0.65rem] leading-tight font-bold text-black/70 uppercase md:text-xs'>
            Rol: {ROLE_LABELS[profile.role] ?? profile.role}
          </p>

          <div className='mt-1'>
            <p className='font-pt-mono text-[0.6rem] font-bold text-black/50 uppercase md:text-[0.65rem]'>
              Actividad destacada:
            </p>
            <p className='font-pt-mono text-[0.6rem] leading-tight whitespace-pre-line text-red-600 md:text-[0.65rem]'>
              {profile.activity_highlight}
            </p>
          </div>

          <div className='mt-auto mb-1 w-full pt-2'>
            <span className='font-baby-doll inline-block w-full border-2 border-red-600 bg-red-600 px-3 py-1 text-[0.65rem] font-bold tracking-wider text-white uppercase transition-colors group-hover:bg-red-700 md:text-xs'>
              Ver perfil
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

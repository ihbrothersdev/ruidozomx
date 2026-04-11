'use client'

/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import Link from 'next/link'
import type { CommunityProfile } from '../types'

const ROLE_LABELS: Record<string, string> = {
  banda: 'Banda/Solista',
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
      className='group relative block w-full'
      style={{ aspectRatio: '3 / 4' }}
    >
      {/* ── Layer 1: Fondo (background texture) ── */}
      <Image
        src='/assets/comunidad/cards/fondo.png'
        alt=''
        fill
        className='object-cover'
        unoptimized
      />

      {/* ── Layer 2: Marco de foto + photo inside ── */}
      <div
        className='absolute overflow-hidden'
        style={{ left: '25%', top: '6.25%', width: '49.67%', height: '46.5%' }}
      >
        <Image
          src='/assets/comunidad/cards/marco-foto.png'
          alt=''
          fill
          className='object-fill'
          unoptimized
        />
        {/* Photo area — inside the red bars (22px each = 5.5% card, 1.17% sides) */}
        <div
          className='absolute overflow-hidden bg-[#e8b4a8]'
          style={{ left: '2.35%', top: '11.8%', right: '2.35%', bottom: '11.8%' }}
        >
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
      </div>

      {/* ── Layer 3: Pinza (full-card overlay — clip + borders) ── */}
      <Image
        src='/assets/comunidad/cards/pinza.png'
        alt=''
        fill
        className='object-cover'
        unoptimized
      />

      {/* ── Layer 4: Text (above pinza overlay) ── */}
      <div
        className='absolute inset-x-0 flex flex-col items-center gap-0.5 px-[8%] text-center'
        style={{ top: '56%' }}
      >
        <p className='font-baby-doll w-full truncate font-bold leading-tight text-black uppercase [font-size:3.2vw] sm:[font-size:2vw] lg:[font-size:1.4vw]'>
          {profile.display_name}
        </p>
        <p className='font-pt-mono w-full leading-tight text-black/60 uppercase [font-size:2.4vw] sm:[font-size:1.5vw] lg:[font-size:1.1vw]'>
          {location}
        </p>
        <p className='font-pt-mono w-full font-bold leading-tight text-black/80 uppercase [font-size:2.4vw] sm:[font-size:1.5vw] lg:[font-size:1.1vw]'>
          Rol: {ROLE_LABELS[profile.role] ?? profile.role}
        </p>

        {/* actividad destacada — desactivada por ahora
        {profile.activity_highlight && (
          <>
            <p className='font-pt-mono w-full font-bold leading-tight text-black/50 uppercase [font-size:2.2vw] sm:[font-size:1.4vw] lg:[font-size:1vw]'>
              Actividad destacada:
            </p>
            <p className='font-pt-mono line-clamp-3 w-full leading-tight text-red-600 [font-size:2.2vw] sm:[font-size:1.4vw] lg:[font-size:1vw]'>
              {profile.activity_highlight}
            </p>
          </>
        )}
        */}
      </div>

      {/* ── Layer 5: Ver perfil button ── */}
      <div
        className='absolute inset-x-0 flex justify-center transition-opacity group-hover:opacity-80'
        style={{ bottom: '5%' }}
      >
        <Image
          src='/assets/comunidad/cards/boton-ver-perfil.png'
          alt='Ver perfil'
          width={112}
          height={19}
          className='w-[37.3%]'
          style={{ height: 'auto' }}
          unoptimized
        />
      </div>
    </Link>
  )
}

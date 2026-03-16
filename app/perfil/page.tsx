import { createClient } from '@/lib/supabase/server'
import { ROLE_LABELS, type Role } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const ROLE_TABLE: Record<Role, string> = {
  banda: 'band_profiles',
  fan: 'fan_profiles',
  manager: 'manager_profiles',
  agente: 'agent_profiles',
  promotor: 'promoter_profiles',
  proveedor: 'provider_profiles',
  venue: 'venue_profiles'
}

const BOOLEAN_LABELS: Record<string, string> = {
  // Banda
  available_live: 'Disponible para tocar en vivo',
  open_collabs: 'Abierto a colaboraciones',
  available_tours: 'Disponible para giras',
  willing_travel: 'Dispuesto a salir de estado/país',
  publish_dates: 'Publicará fechas en Ruidozo',
  accept_proposals: 'Acepta propuestas directas',
  // Fan
  notify_new_bands: 'Notificaciones de nuevas bandas',
  propose_fav_bands: 'Propondrá bandas favoritas',
  // Manager
  represents_artists: 'Representa artistas',
  promote_bands_ruidozo: 'Promoverá bandas en Ruidozo',
  seeks_emerging_talent: 'Busca talento emergente',
  // Promotor
  organizes_events: 'Organiza eventos',
  provide_events_ruidozo: 'Proporcionará eventos en Ruidozo',
  seeks_talent: 'Busca talento',
  // Agente
  represents_artists_live: 'Representa artistas en vivo',
  seeks_new_projects: 'Busca nuevos proyectos',
  // Proveedor
  publish_services: 'Publicará servicios',
  works_emerging_projects: 'Trabaja con proyectos emergentes',
  // Venue
  has_audio: 'Tiene audio',
  has_lighting: 'Tiene iluminación',
  accepts_indie_proposals: 'Acepta propuestas indie',
  publish_calls_ruidozo: 'Publicará convocatorias en Ruidozo'
}

const ROLE_BOOLEAN_FIELDS: Record<string, string[]> = {
  banda: ['available_live', 'open_collabs', 'available_tours', 'willing_travel', 'publish_dates', 'accept_proposals'],
  fan: ['notify_new_bands', 'propose_fav_bands'],
  manager: ['represents_artists', 'promote_bands_ruidozo', 'seeks_emerging_talent', 'accept_proposals'],
  promotor: ['organizes_events', 'provide_events_ruidozo', 'seeks_talent', 'accept_proposals'],
  agente: ['represents_artists_live', 'provide_events_ruidozo', 'seeks_new_projects', 'accept_proposals'],
  proveedor: ['publish_services', 'accept_proposals', 'works_emerging_projects'],
  venue: ['has_audio', 'has_lighting', 'accepts_indie_proposals', 'publish_calls_ruidozo']
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/iniciar-sesion')
  }

  let profile: Record<string, unknown> | null = null
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  } catch {
    // profiles table may not exist yet
  }

  const displayName =
    (profile?.display_name as string) || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuario'
  const role = (profile?.role as Role) || (user.user_metadata?.role as Role) || null
  const createdAt = new Date(user.created_at).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ')
  const photoUrl = profile?.photo_url as string | null

  // Fetch role-specific profile
  let roleProfile: Record<string, unknown> | null = null
  if (role && ROLE_TABLE[role]) {
    try {
      const { data } = await supabase.from(ROLE_TABLE[role]).select('*').eq('profile_id', user.id).single()
      roleProfile = data
    } catch {
      // role table may not exist yet
    }
  }

  return (
    <div className='relative min-h-screen'>
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10 mx-auto max-w-2xl px-4 py-8'>
        {/* Back to home */}
        <Link
          href='/'
          className='group mb-6 inline-flex items-center gap-3 rounded-sm bg-black/70 px-4 py-2 backdrop-blur-sm transition-colors hover:bg-black/90'
        >
          <Image
            src='/assets/header/logo.png'
            alt='Ruidozo MX'
            width={380}
            height={183}
            className='h-6 w-auto'
            unoptimized
          />
          <span className='font-pt-mono text-xs font-bold tracking-wider text-white/70 uppercase group-hover:text-white'>
            Volver al inicio
          </span>
        </Link>

        {/* Profile card */}
        <div className='relative mt-4 overflow-hidden rounded-sm border-2 border-black/10 bg-white/80 shadow-md backdrop-blur-sm'>
          {/* Red header strip */}
          <div className='flex items-center gap-4 bg-red-600 px-6 py-5'>
            {photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoUrl}
                alt={displayName}
                className='h-16 w-16 rounded-full border-2 border-white/40 object-cover'
              />
            ) : (
              <div className='flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-black/20'>
                <span className='font-baby-doll text-2xl text-white'>{displayName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h1 className='font-baby-doll text-2xl tracking-wider text-white'>{displayName}</h1>
              {role && (
                <span className='font-pt-mono text-xs tracking-wider text-white/70 uppercase'>
                  {ROLE_LABELS[role] ?? role}
                </span>
              )}
            </div>
          </div>

          <div className='space-y-5 p-6'>
            {/* Basic info grid */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <InfoItem
                label='Email'
                value={user.email ?? '—'}
              />
              <InfoItem
                label='Miembro desde'
                value={createdAt}
              />
              {location && (
                <InfoItem
                  label='Ubicación'
                  value={location}
                />
              )}
              <InfoItem
                label='Email confirmado'
                value={user.email_confirmed_at ? 'Si' : 'Pendiente'}
              />
            </div>

            {/* Role-specific details */}
            {roleProfile && role && (
              <div className='border-t border-black/10 pt-4'>
                <h2 className='font-pt-mono mb-3 text-xs font-bold tracking-wider text-black/50 uppercase'>
                  Datos de {ROLE_LABELS[role] ?? role}
                </h2>

                {/* Text fields */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <RoleTextFields
                    role={role}
                    data={roleProfile}
                  />
                </div>

                {/* Review / Description */}
                {Boolean(roleProfile.review || roleProfile.description) && (
                  <div className='mt-4'>
                    <span className='font-pt-mono text-[11px] font-bold tracking-wider text-black/50 uppercase'>
                      {roleProfile.review ? 'Reseña' : 'Descripción'}
                    </span>
                    <p className='font-pt-mono mt-1 text-sm leading-relaxed text-black/80'>
                      {(roleProfile.review as string) || (roleProfile.description as string)}
                    </p>
                  </div>
                )}

                {/* Array fields (genres, territorial_reach, etc.) */}
                <RoleArrayFields
                  role={role}
                  data={roleProfile}
                />

                {/* Boolean flags */}
                {ROLE_BOOLEAN_FIELDS[role] && (
                  <div className='mt-4'>
                    <span className='font-pt-mono text-[11px] font-bold tracking-wider text-black/50 uppercase'>
                      Preferencias
                    </span>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {ROLE_BOOLEAN_FIELDS[role].map(field => (
                        <span
                          key={field}
                          className={`font-pt-mono inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[11px] font-bold tracking-wider ${
                            roleProfile[field] ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-400'
                          }`}
                        >
                          <span>{roleProfile[field] ? '●' : '○'}</span>
                          {BOOLEAN_LABELS[field] ?? field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick links */}
            <div className='border-t border-black/10 pt-4'>
              <h2 className='font-pt-mono mb-3 text-xs font-bold tracking-wider text-black/50 uppercase'>Acciones</h2>
              <div className='flex flex-wrap gap-3'>
                <Link
                  href='/proponer-rola'
                  className='font-pt-mono rounded-sm bg-orange-500 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-orange-600'
                >
                  Proponer rola
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className='font-pt-mono text-[11px] font-bold tracking-wider text-black/50 uppercase'>{label}</span>
      <p className='font-pt-mono text-sm text-black'>{value}</p>
    </div>
  )
}

function RoleTextFields({ role, data }: { role: Role; data: Record<string, unknown> }) {
  const fields: { label: string; key: string }[] = []

  switch (role) {
    case 'banda':
      fields.push(
        { label: 'Nombre del proyecto', key: 'band_name' },
        { label: 'Tipo de proyecto', key: 'project_type' },
        { label: 'Género principal', key: 'genre' },
        { label: 'Link del proyecto', key: 'project_link' },
        { label: 'Contacto', key: 'contact' }
      )
      break
    case 'fan':
      fields.push({ label: 'Alias', key: 'alias' })
      break
    case 'manager':
      fields.push(
        { label: 'Nombre completo', key: 'full_name' },
        { label: 'Sitio web', key: 'web_link' },
        { label: 'Artistas representados', key: 'artists_represented' },
        { label: 'Contacto', key: 'contact' }
      )
      break
    case 'promotor':
      fields.push(
        { label: 'Nombre completo', key: 'full_name' },
        { label: 'Sitio web', key: 'web_link' },
        { label: 'Contacto', key: 'contact' }
      )
      break
    case 'agente':
      fields.push(
        { label: 'Nombre completo', key: 'full_name' },
        { label: 'Sitio web', key: 'web_link' },
        { label: 'Contacto', key: 'contact' }
      )
      break
    case 'proveedor':
      fields.push(
        { label: 'Marca / Nombre', key: 'brand_name' },
        { label: 'Sitio web', key: 'web_link' },
        { label: 'Contacto', key: 'contact' }
      )
      break
    case 'venue':
      fields.push(
        { label: 'Nombre del venue', key: 'venue_name' },
        { label: 'Sitio web', key: 'web_link' },
        { label: 'Capacidad', key: 'capacity' },
        { label: 'Contacto', key: 'contact' }
      )
      break
  }

  return (
    <>
      {fields
        .filter(f => Boolean(data[f.key]))
        .map(f => (
          <InfoItem
            key={f.key}
            label={f.label}
            value={String(data[f.key])}
          />
        ))}
    </>
  )
}

function RoleArrayFields({ role, data }: { role: Role; data: Record<string, unknown> }) {
  const sections: { label: string; key: string }[] = []

  switch (role) {
    case 'fan':
      sections.push({ label: 'Géneros favoritos', key: 'favorite_genres' })
      break
    case 'promotor':
      sections.push(
        { label: 'Alcance territorial', key: 'territorial_reach' },
        { label: 'Tipos de eventos', key: 'event_types' }
      )
      break
    case 'agente':
      sections.push({ label: 'Alcance territorial', key: 'territorial_reach' })
      break
    case 'proveedor':
      sections.push(
        { label: 'Alcance territorial', key: 'territorial_reach' },
        { label: 'Tipos de servicio', key: 'service_types' }
      )
      break
    case 'venue':
      sections.push({ label: 'Tipo de venue', key: 'venue_type' })
      break
  }

  const rendered = sections.filter(s => {
    const val = data[s.key]
    return Array.isArray(val) && val.length > 0
  })

  if (rendered.length === 0) return null

  return (
    <>
      {rendered.map(s => (
        <div
          key={s.key}
          className='mt-4'
        >
          <span className='font-pt-mono text-[11px] font-bold tracking-wider text-black/50 uppercase'>{s.label}</span>
          <div className='mt-1.5 flex flex-wrap gap-1.5'>
            {(data[s.key] as string[]).map(item => (
              <span
                key={item}
                className='font-pt-mono rounded-sm bg-black/10 px-2.5 py-1 text-[11px] font-bold tracking-wider text-black/70'
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

/* eslint-disable @next/next/no-img-element */
import { Header } from '@/app/components/layout/Header'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const ROLE_LABELS: Record<string, string> = {
  banda: 'Banda / Solista',
  fan: 'Fan / Público',
  venue: 'Foro / Venue',
  promotor: 'Promotor',
  manager: 'Manager',
  agente: 'Agente',
  proveedor: 'Proveedor',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CommunityProfilePage({ params }: PageProps) {
  const { id } = await params

  let user = null
  let photoUrl: string | null = null
  let profile: {
    id: string
    display_name: string
    photo_url: string | null
    role: string
    city: string | null
    state: string | null
    country: string
    bio: string | null
  } | null = null

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Get current user for header
    const { data: authData } = await supabase.auth.getUser()
    user = authData.user
    if (user) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('photo_url')
        .eq('id', user.id)
        .single()
      photoUrl = (userProfile?.photo_url as string) || null
    }

    // Fetch profile from DB
    const { data: dbProfile } = await supabase
      .from('profiles')
      .select('id, display_name, photo_url, role, city, state, country, bio')
      .eq('id', id)
      .single()

    if (dbProfile) {
      profile = {
        ...dbProfile,
        country: dbProfile.country ?? 'México',
      }
    }
  } catch {
    // Supabase not configured
  }

  if (!profile) {
    redirect('/comunidad')
  }

  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ')

  return (
    <main className='relative min-h-screen'>
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10'>
        <Header user={user} photoUrl={photoUrl} />

        <div className='mx-auto max-w-2xl px-4 pt-8 pb-16 md:px-8'>
          {/* Back link */}
          <Link
            href='/comunidad'
            className='font-pt-mono mb-6 inline-block text-sm font-bold tracking-wider text-white/60 uppercase transition-colors hover:text-white'
          >
            ← Volver a la comunidad
          </Link>

          {/* Profile card */}
          <div className='relative flex flex-col items-center'>
            <div className='w-full border-2 border-black/10 bg-[#e8e2d6] shadow-lg'>
              <div className='flex flex-col items-center gap-4 p-6 md:flex-row md:items-start md:gap-8 md:p-8'>
                {/* Photo */}
                <div className='relative aspect-[4/5] w-48 shrink-0 overflow-hidden bg-[#e8b4a8] md:w-56'>
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.display_name}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <span className='font-baby-doll text-5xl font-bold text-black/20 uppercase'>
                        {profile.display_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className='flex flex-col gap-3 text-center md:text-left'>
                  <h1 className='font-baby-doll text-2xl font-bold text-black uppercase md:text-3xl'>
                    {profile.display_name}
                  </h1>
                  <div className='flex flex-col gap-1'>
                    <p className='font-pt-mono text-xs font-bold text-black/60 uppercase'>
                      {ROLE_LABELS[profile.role] ?? profile.role}
                    </p>
                    <p className='font-pt-mono text-xs text-black/50 uppercase'>{location}</p>
                  </div>
                  {profile.bio && (
                    <p className='font-pt-mono text-sm leading-relaxed text-black/70'>{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

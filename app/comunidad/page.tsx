import { Header } from '@/app/components/layout/Header'
import type { Metadata } from 'next'
import { CommunityGrid } from './_components/CommunityGrid'
import type { CommunityProfile } from './types'

export const metadata: Metadata = {
  title: 'Comunidad',
  description: 'Explora y conecta con artistas, bandas, venues, managers y promotores de la escena mexicana.'
}

export default async function ComunidadPage() {
  let user = null
  let photoUrl: string | null = null
  let role: string | null = null
  let profiles: CommunityProfile[] = []

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Get current user for header
    const { data: authData } = await supabase.auth.getUser()
    user = authData.user

    if (user) {
      const { data: userProfile } = await supabase.from('profiles').select('photo_url, role').eq('id', user.id).single()
      photoUrl = (userProfile?.photo_url as string) || null
      role = (userProfile?.role as string) || null
    }

    // Fetch all active community profiles
    const { data: dbProfiles } = await supabase
      .from('profiles')
      .select('id, display_name, slug, photo_url, role, city, state, country, bio')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (dbProfiles) {
      profiles = dbProfiles.map(p => ({
        id: p.id,
        display_name: p.display_name,
        slug: p.slug,
        photo_url: p.photo_url,
        role: p.role,
        city: p.city,
        state: p.state,
        country: p.country ?? 'México',
        bio: p.bio,
        activity_highlight: getActivityHighlight(p.role)
      }))
    }
  } catch {
    // Supabase not configured
  }

  return (
    <main className='relative min-h-screen'>
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10'>
        <Header
          user={user}
          photoUrl={photoUrl}
          role={role}
        />

        <div className='mx-auto max-w-7xl px-4 pt-4 pb-12 md:px-8'>
          <CommunityGrid profiles={profiles} />
        </div>
      </div>
    </main>
  )
}

function getActivityHighlight(role: string): string {
  switch (role) {
    case 'banda':
      return 'Rolas propuestas al cassete'
    case 'fan':
      return 'Rolas propuestas al cassete\nBandas que le gustan'
    case 'venue':
      return 'Fechas disponibles'
    case 'promotor':
      return 'Eventos activos'
    case 'manager':
      return 'Artistas representados'
    case 'agente':
      return 'Circuitos armados'
    case 'proveedor':
      return 'Servicios publicados'
    default:
      return ''
  }
}

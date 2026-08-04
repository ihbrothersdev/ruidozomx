import { Header } from '@/app/components/layout/Header'
import type { Role } from '@/lib/types'
import type { Metadata } from 'next'
import { CommunityGrid } from './_components/CommunityGrid'
import type { CommunityProfile } from './types'

type ProfileRow = {
  id: string
  display_name: string
  slug: string
  photo_url: string | null
  role: Role
  city: string | null
  state: string | null
  country: string | null
  bio: string | null
}

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

    // Fetch all active community profiles, paginating past PostgREST's 1000-row cap
    const BATCH = 1000
    const dbProfiles: ProfileRow[] = []
    for (let from = 0; ; from += BATCH) {
      const { data: batch } = await supabase
        .from('profiles')
        .select('id, display_name, slug, photo_url, role, city, state, country, bio')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .range(from, from + BATCH - 1)
      if (!batch?.length) break
      dbProfiles.push(...batch)
      if (batch.length < BATCH) break
    }

    // Genres live in band_profiles, so they're fetched separately and joined by id
    const genreByProfileId = new Map<string, string>()
    for (let from = 0; ; from += BATCH) {
      const { data: batch } = await supabase
        .from('band_profiles')
        .select('profile_id, genre')
        .not('genre', 'is', null)
        .order('profile_id', { ascending: true })
        .range(from, from + BATCH - 1)
      if (!batch?.length) break
      for (const b of batch) {
        if (b.genre) genreByProfileId.set(b.profile_id as string, b.genre as string)
      }
      if (batch.length < BATCH) break
    }

    if (dbProfiles.length) {
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
        genre: genreByProfileId.get(p.id) ?? null,
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

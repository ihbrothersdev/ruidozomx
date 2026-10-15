import { Header } from '@/app/components/layout/Header'
import type { Role } from '@/lib/types'
import type { Metadata } from 'next'
import { CommunityGrid } from './_components/CommunityGrid'
import type { CommunityProfile, PendingFlags } from './types'

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
  let accountStatus: AccountStatus | null = null

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

    // Started now so it overlaps the profile fetch below; a failure only hides the admin filter.
    const accountStatusPromise = role === 'admin' ? getAccountStatus().catch(() => null) : null

    // Fetch all active community profiles, paginating past PostgREST's 1000-row cap
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

    accountStatus = await accountStatusPromise

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
        activity_highlight: getActivityHighlight(p.role),
        ...(accountStatus && { pending: getPending(p.id, accountStatus) })
      }))
    }
  } catch {
    // Supabase not configured
  }

  return (
    <main className='relative min-h-screen'>
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.webp')" }}
      />

      <div className='relative z-10'>
        <Header
          user={user}
          photoUrl={photoUrl}
          role={role}
        />

        <div className='mx-auto max-w-7xl px-4 pt-4 pb-12 md:px-8'>
          <CommunityGrid
            profiles={profiles}
            showAdminFilter={accountStatus !== null}
          />
        </div>
      </div>
    </main>
  )
}

const BATCH = 1000

type AccountStatus = { unconfirmed: Set<string>; withSongs: Set<string> }

/**
 * Data for the admin-only cleanup filter: who never confirmed their email and who
 * has proposed or been credited with a rola. Soft-deleted proposals count: they
 * did upload once.
 */
async function getAccountStatus(): Promise<AccountStatus> {
  const { createServiceClient } = await import('@/lib/supabase/service')
  const svc = createServiceClient()

  async function getUnconfirmed() {
    const ids = new Set<string>()
    for (let page = 1; ; page++) {
      const { data, error } = await svc.auth.admin.listUsers({ page, perPage: BATCH })
      if (error) throw error
      for (const u of data.users) if (!u.email_confirmed_at) ids.add(u.id)
      if (data.users.length < BATCH) break
    }
    return ids
  }

  async function getWithSongs() {
    const ids = new Set<string>()
    for (let from = 0; ; from += BATCH) {
      const { data, error } = await svc
        .from('song_proposals')
        .select('user_id')
        .order('id')
        .range(from, from + BATCH - 1)
      if (error) throw error
      for (const p of data) ids.add(p.user_id as string)
      if (data.length < BATCH) break
    }
    for (let from = 0; ; from += BATCH) {
      const { data, error } = await svc
        .from('songs')
        .select('artist_profile_id')
        .not('artist_profile_id', 'is', null)
        .order('id')
        .range(from, from + BATCH - 1)
      if (error) throw error
      for (const s of data) ids.add(s.artist_profile_id as string)
      if (data.length < BATCH) break
    }
    return ids
  }

  const [unconfirmed, withSongs] = await Promise.all([getUnconfirmed(), getWithSongs()])
  return { unconfirmed, withSongs }
}

function getPending(id: string, status: AccountStatus): PendingFlags | undefined {
  const unconfirmed = status.unconfirmed.has(id)
  const noSongs = !status.withSongs.has(id)
  return unconfirmed || noSongs ? { unconfirmed, noSongs } : undefined
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

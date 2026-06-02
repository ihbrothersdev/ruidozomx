import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/types'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import ProfileView from './_components/ProfileView'
import { ROLE_TABLE } from './_components/profile-constants'

export const metadata: Metadata = {
  title: 'Mi perfil',
  description: 'Tu perfil en Ruidozo MX.',
  robots: { index: false, follow: false }
}

export default async function PerfilPage({
  searchParams
}: {
  searchParams: Promise<{ debug_uid?: string }>
}) {
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

  // Dev-only: pass ?debug_uid=<uuid> to impersonate another profile for testing.
  // Ignored entirely in production.
  const { debug_uid } = await searchParams
  const isDebug = process.env.NODE_ENV === 'development' && !!debug_uid
  const profileId = isDebug ? debug_uid! : (profile?.id as string ?? user.id)

  // If debugging a different profile, re-fetch by slug (falls back to id lookup)
  if (isDebug) {
    try {
      // Try slug first, then UUID
      const { data: bySlug } = await supabase.from('profiles').select('*').eq('slug', debug_uid!).maybeSingle()
      if (bySlug) {
        profile = bySlug
      } else {
        const { data: byId } = await supabase.from('profiles').select('*').eq('id', debug_uid!).maybeSingle()
        if (byId) profile = byId
      }
    } catch {}
  }

  // Re-derive profileId from the (possibly re-fetched) profile
  const resolvedProfileId = isDebug ? (profile?.id as string ?? user.id) : profileId

  const displayName =
    (profile?.display_name as string) || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuario'
  const role = (profile?.role as Role) || (user.user_metadata?.role as Role) || null
  const location = [profile?.city, profile?.country].filter(Boolean).join(', ')
  const photoUrl = profile?.photo_url as string | null
  const socialLinks = (profile?.social_links as Record<string, string>) || null
  const bio = profile?.bio as string | null

  // Fetch role-specific profile
  let roleProfile: Record<string, unknown> | null = null
  if (role && ROLE_TABLE[role]) {
    try {
      const { data } = await supabase.from(ROLE_TABLE[role]).select('*').eq('profile_id', resolvedProfileId).single()
      roleProfile = data
    } catch {
      // role table may not exist yet
    }
  }

  const contact = (profile?.contact as string) || null
  const acceptProposals = Boolean(roleProfile?.accept_proposals ?? roleProfile?.accepts_indie_proposals)

  // Fetch this user's song proposals (latest 3 for display) + total count
  // for the badge. RLS allows users to read their own; on stranger profiles
  // RLS returns 0 and the module is auto-hidden by DynamicModules.
  const [{ data: songProposalsData }, { count: songProposalsCount }] = await Promise.all([
    supabase
      .from('song_proposals')
      .select('id, title, artist, status, created_at')
      .eq('user_id', resolvedProfileId)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('song_proposals').select('*', { count: 'exact', head: true }).eq('user_id', resolvedProfileId)
  ])

  return (
    <ProfileView
      displayName={displayName}
      role={role}
      location={location}
      photoUrl={photoUrl}
      bio={bio || undefined}
      contact={contact}
      socialLinks={socialLinks}
      roleProfile={roleProfile}
      isOwnProfile={true}
      isLoggedIn={true}
      acceptProposals={acceptProposals}
      songProposals={songProposalsData ?? []}
      songProposalsCount={songProposalsCount ?? 0}
    />
  )
}

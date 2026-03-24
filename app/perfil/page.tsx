import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/types'
import { redirect } from 'next/navigation'
import ProfileView from './_components/ProfileView'
import { ROLE_TABLE } from './_components/profile-constants'

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
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ')
  const photoUrl = profile?.photo_url as string | null
  const socialLinks = (profile?.social_links as Record<string, string>) || null

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

  const acceptProposals = Boolean(roleProfile?.accept_proposals ?? roleProfile?.accepts_indie_proposals)

  return (
    <ProfileView
      displayName={displayName}
      role={role}
      location={location}
      photoUrl={photoUrl}
      socialLinks={socialLinks}
      roleProfile={roleProfile}
      isOwnProfile={true}
      acceptProposals={acceptProposals}
    />
  )
}

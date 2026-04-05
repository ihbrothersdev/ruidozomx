import { createClient } from '@/lib/supabase/server'
import { ROLE_LABELS, type Role } from '@/lib/types'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import ProfileView from '../_components/ProfileView'
import { ROLE_TABLE } from '../_components/profile-constants'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('display_name, role, bio').eq('slug', slug).single()

  if (!profile) {
    return { title: 'Perfil no encontrado — Ruidozo MX' }
  }

  const roleLabel = profile.role ? (ROLE_LABELS[profile.role as Role] ?? profile.role) : ''

  return {
    title: `${profile.display_name} — ${roleLabel} — Ruidozo MX`,
    description: profile.bio || `Perfil de ${profile.display_name} en Ruidozo MX`
  }
}

export default async function PublicPerfilPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch base profile by slug
  const { data: profile } = await supabase.from('profiles').select('*').eq('slug', slug).single()

  if (!profile) {
    notFound()
  }

  const role = profile.role as Role
  const displayName = profile.display_name || 'Usuario'
  const location = [profile.city, profile.country].filter(Boolean).join(', ')
  const photoUrl = profile.photo_url as string | null
  const socialLinks = (profile.social_links as Record<string, string>) || null

  // Check if current user is the profile owner
  const {
    data: { user }
  } = await supabase.auth.getUser()
  const isOwnProfile = !!user && user.id === profile.id

  // If viewing own profile via slug, redirect to /perfil
  if (isOwnProfile) {
    redirect('/perfil')
  }

  // Fetch role-specific profile
  let roleProfile: Record<string, unknown> | null = null
  if (role && ROLE_TABLE[role]) {
    try {
      const { data } = await supabase.from(ROLE_TABLE[role]).select('*').eq('profile_id', profile.id).single()
      roleProfile = data
    } catch {
      // role table may not exist yet
    }
  }

  const acceptProposals = Boolean(roleProfile?.accept_proposals ?? roleProfile?.accepts_indie_proposals)

  return (
    <ProfileView
      profileId={profile.id}
      displayName={displayName}
      role={role}
      location={location}
      photoUrl={photoUrl}
      bio={(profile.bio as string) || undefined}
      contact={(profile.contact as string) || null}
      socialLinks={socialLinks}
      roleProfile={roleProfile}
      isOwnProfile={isOwnProfile}
      isLoggedIn={!!user}
      acceptProposals={acceptProposals}
    />
  )
}

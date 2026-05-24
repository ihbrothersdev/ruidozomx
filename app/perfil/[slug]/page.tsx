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

  // Admin check — admins can edit and (soft-)delete other profiles.
  let isAdmin = false
  if (user) {
    const { data: viewerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isAdmin = viewerProfile?.role === 'admin'
  }

  // For admins, look up whether the target has confirmed their email so we
  // can offer a one-click "Confirmar cuenta" action. Only admins get this
  // info — service client bypasses RLS.
  let isUserConfirmed: boolean | undefined = undefined
  if (isAdmin) {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const adminClient = createServiceClient()
    const { data: targetAuth } = await adminClient.auth.admin.getUserById(profile.id)
    isUserConfirmed = Boolean(targetAuth?.user?.email_confirmed_at)
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
  const lastActivityAt = profile.last_activity_at as string | null

  // Check if current user already sent a proposal or interest to this profile
  const alreadySent = {
    proposal: false,
    sendInterest: false
  }
  if (user) {
    const [proposalCheck, interestCheck] = await Promise.all([
      supabase
        .from('user_proposals')
        .select('id')
        .eq('from_profile_id', user.id)
        .eq('to_profile_id', profile.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('interests')
        .select('id')
        .eq('from_profile_id', user.id)
        .eq('to_profile_id', profile.id)
        .limit(1)
        .maybeSingle()
    ])
    alreadySent.proposal = !!proposalCheck.data
    alreadySent.sendInterest = !!interestCheck.data
  }

  // Profile owner's song proposals (latest 3 for display) + total count for
  // the badge. RLS only returns rows when the viewer is the proposal owner
  // or an admin — for everyone else both come back empty and the module is
  // auto-hidden by DynamicModules.
  const [{ data: songProposalsData }, { count: songProposalsCount }, { data: eventsData }] = await Promise.all([
    supabase
      .from('song_proposals')
      .select('id, title, artist, status, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('song_proposals').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    // Upcoming events. RLS lets the public read `published` and `draft`; the
    // owner also sees their own. Cancelled is hidden via the query filter.
    supabase
      .from('events')
      .select('id, title, event_date, event_type, venue_name, city, status')
      .eq('profile_id', profile.id)
      .neq('status', 'cancelled')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(5)
  ])

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
      alreadySent={alreadySent}
      songProposals={songProposalsData ?? []}
      songProposalsCount={songProposalsCount ?? 0}
      events={eventsData ?? []}
      lastActivityAt={lastActivityAt}
      isAdmin={isAdmin}
      isUserConfirmed={isUserConfirmed}
      country={(profile.country as string | null) ?? null}
      state={(profile.state as string | null) ?? null}
      city={(profile.city as string | null) ?? null}
    />
  )
}

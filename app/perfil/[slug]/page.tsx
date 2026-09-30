import { getProfileFeaturedSongs } from '@/lib/supabase/featured-songs'
import { createClient } from '@/lib/supabase/server'
import { ROLE_LABELS, type Role } from '@/lib/types'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import ProfileView from '../_components/ProfileView'
import { ROLE_TABLE } from '../_components/profile-constants'
interface Props {
  params: Promise<{ slug: string }>
}

const getProfileBySlug = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('slug', slug).single()
  return data
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const profile = await getProfileBySlug(slug)

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

  const [
    profile,
    {
      data: { user }
    }
  ] = await Promise.all([getProfileBySlug(slug), supabase.auth.getUser()])

  if (!profile) {
    notFound()
  }

  const role = profile.role as Role
  const displayName = profile.display_name || 'Usuario'
  const location = [profile.city, profile.country].filter(Boolean).join(', ')
  const photoUrl = profile.photo_url as string | null
  const socialLinks = (profile.social_links as Record<string, string>) || null

  const isOwnProfile = !!user && user.id === profile.id

  if (isOwnProfile) {
    redirect('/perfil')
  }

  // `event_date` is a `date` column (no time, no timezone). Compare against
  // today as a YYYY-MM-DD string so a same-day event stays visible all day.
  const todayDate = new Date().toISOString().slice(0, 10)

  // Everything below depends only on the profile (and the viewer), so it all
  // goes out in one round instead of a waterfall.
  const [
    viewerRole,
    alreadySent,
    { data: roleProfile },
    { data: songProposalsData },
    { count: songProposalsCount },
    { data: eventsData },
    featuredSongs
  ] = await Promise.all([
    user
      ? supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => data?.role ?? null)
      : null,
    user
      ? Promise.all([
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
        ]).then(([proposalCheck, interestCheck]) => ({
          proposal: !!proposalCheck.data,
          sendInterest: !!interestCheck.data
        }))
      : { proposal: false, sendInterest: false },
    role && ROLE_TABLE[role]
      ? supabase.from(ROLE_TABLE[role]).select('*').eq('profile_id', profile.id).single()
      : { data: null },
    // Profile owner's song proposals (latest 3 for display) + total count for
    // the badge. RLS only returns rows when the viewer is the proposal owner
    // or an admin — for everyone else both come back empty and the module is
    // auto-hidden by DynamicModules.
    supabase
      .from('song_proposals')
      .select('id, title, artist, status, created_at')
      .eq('user_id', profile.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('song_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .is('deleted_at', null),
    // Upcoming events. RLS lets the public read `published`; the owner also
    // sees their own. Cancelled is hidden via the query filter.
    supabase
      .from('events')
      .select('id, title, event_date, event_type, venue_name, city, address, description, external_link, status')
      .eq('profile_id', profile.id)
      .neq('status', 'cancelled')
      .gte('event_date', todayDate)
      .order('event_date', { ascending: true })
      .limit(5),
    // Rolas shown publicly (with inline playback): the band's live proposals plus
    // its cassette tracks. Derived — there is nothing to curate anymore.
    role === 'banda' ? getProfileFeaturedSongs(supabase, profile.id) : []
  ])

  // Admins can edit and (soft-)delete other profiles, and get a one-click
  // "Confirmar cuenta" when the target hasn't confirmed their email. Service
  // client bypasses RLS, so only admins get this info.
  const isAdmin = viewerRole === 'admin'
  let isUserConfirmed: boolean | undefined = undefined
  if (isAdmin) {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const adminClient = createServiceClient()
    const { data: targetAuth } = await adminClient.auth.admin.getUserById(profile.id)
    isUserConfirmed = Boolean(targetAuth?.user?.email_confirmed_at)
  }

  const acceptProposals = Boolean(roleProfile?.accept_proposals ?? roleProfile?.accepts_indie_proposals)
  const lastActivityAt = profile.last_activity_at as string | null

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
      featuredSongs={featuredSongs}
    />
  )
}

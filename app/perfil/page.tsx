import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/types'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { markReceivedProposalsAsSeen } from './actions'
import ProfileView from './_components/ProfileView'
import { ROLE_TABLE } from './_components/profile-constants'

export const metadata: Metadata = {
  title: 'Mi perfil',
  description: 'Tu perfil en Ruidozo MX.',
  robots: { index: false, follow: false }
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
  const location = [profile?.city, profile?.country].filter(Boolean).join(', ')
  const photoUrl = profile?.photo_url as string | null
  const socialLinks = (profile?.social_links as Record<string, string>) || null
  const bio = profile?.bio as string | null

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

  const contact = (profile?.contact as string) || null
  const acceptProposals = Boolean(roleProfile?.accept_proposals ?? roleProfile?.accepts_indie_proposals)
  const lastActivityAt = profile?.last_activity_at as string | null

  // Mark inbound proposals as seen before reading them. Tracked for future
  // unread-state UX; doesn't gate rendering today.
  await markReceivedProposalsAsSeen()

  // Fetch this user's song proposals (latest 3 for display) + total count
  // for the badge. RLS allows users to read their own; on stranger profiles
  // RLS returns 0 and the module is auto-hidden by DynamicModules.
  const CONNECTIONS_SHOWN = 5
  const CONNECTION_SELECT =
    'id, message, created_at, other_profile:profiles!{FK}(id, slug, display_name, role, photo_url)'
  const PROPOSAL_SELECT =
    'id, message, status, created_at, responded_at, other_profile:profiles!{FK}(id, slug, display_name, role, photo_url)'

  // `event_date` is a `date` column (no time, no timezone). Compare against
  // today as a YYYY-MM-DD string so a same-day event stays visible all day.
  const todayDate = new Date().toISOString().slice(0, 10)

  const [
    { data: songProposalsData },
    { count: songProposalsCount },
    { data: eventsData },
    { data: receivedRaw },
    { count: receivedCount },
    { data: sentRaw },
    { count: sentCount },
    { data: receivedProposalsRaw },
    { count: receivedProposalsCount },
    { data: sentProposalsRaw },
    { count: sentProposalsCount }
  ] = await Promise.all([
    supabase
      .from('song_proposals')
      .select('id, title, artist, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('song_proposals').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    // Upcoming events (cancelled excluded).
    supabase
      .from('events')
      .select('id, title, event_date, event_type, venue_name, city, address, description, status')
      .eq('profile_id', user.id)
      .neq('status', 'cancelled')
      .gte('event_date', todayDate)
      .order('event_date', { ascending: true })
      .limit(5),
    // Connections received: someone sent the user an interest. Join the
    // sender profile so we can render avatar + name + link.
    supabase
      .from('interests')
      .select(CONNECTION_SELECT.replace('{FK}', 'from_profile_id'))
      .eq('to_profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(CONNECTIONS_SHOWN),
    supabase.from('interests').select('*', { count: 'exact', head: true }).eq('to_profile_id', user.id),
    // Connections sent: the user reached out to someone. Join the recipient.
    supabase
      .from('interests')
      .select(CONNECTION_SELECT.replace('{FK}', 'to_profile_id'))
      .eq('from_profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(CONNECTIONS_SHOWN),
    supabase.from('interests').select('*', { count: 'exact', head: true }).eq('from_profile_id', user.id),
    // User proposals received (someone proposed to the user). Join the sender.
    supabase
      .from('user_proposals')
      .select(PROPOSAL_SELECT.replace('{FK}', 'from_profile_id'))
      .eq('to_profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(CONNECTIONS_SHOWN),
    supabase
      .from('user_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('to_profile_id', user.id),
    // User proposals sent. Join the recipient.
    supabase
      .from('user_proposals')
      .select(PROPOSAL_SELECT.replace('{FK}', 'to_profile_id'))
      .eq('from_profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(CONNECTIONS_SHOWN),
    supabase
      .from('user_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('from_profile_id', user.id)
  ])

  // Lightweight ID-only queries to compute the mutual set (intersection of
  // "people who connected with me" and "people I connected with"). Cheap
  // because we only read a single column per row, with no joins.
  const [{ data: incomingIds }, { data: outgoingIds }] = await Promise.all([
    supabase.from('interests').select('from_profile_id').eq('to_profile_id', user.id),
    supabase.from('interests').select('to_profile_id').eq('from_profile_id', user.id)
  ])
  const incomingSet = new Set((incomingIds ?? []).map(r => r.from_profile_id as string))
  const mutualIds = (outgoingIds ?? [])
    .map(r => r.to_profile_id as string)
    .filter(id => incomingSet.has(id))

  // The Supabase typing for the joined relation is loose; the actual shape is
  // a single profile row (or null). Coerce to the InterestSummary contract.
  type RawInterest = {
    id: string
    message: string | null
    created_at: string
    other_profile: {
      id: string
      slug: string | null
      display_name: string | null
      role: Role | null
      photo_url: string | null
    } | null
  }
  const normalize = (rows: unknown[] | null) =>
    (rows as RawInterest[] | null)?.filter(r => r.other_profile).map(r => ({
      id: r.id,
      message: r.message,
      created_at: r.created_at,
      otherProfile: r.other_profile!
    })) ?? []

  const receivedConnections = normalize(receivedRaw)
  const sentConnections = normalize(sentRaw)

  type RawProposal = {
    id: string
    message: string
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
    created_at: string
    responded_at: string | null
    other_profile: {
      id: string
      slug: string | null
      display_name: string | null
      role: Role | null
      photo_url: string | null
    } | null
  }
  const normalizeProposals = (rows: unknown[] | null) =>
    (rows as RawProposal[] | null)?.filter(r => r.other_profile).map(r => ({
      id: r.id,
      message: r.message,
      status: r.status,
      created_at: r.created_at,
      responded_at: r.responded_at,
      otherProfile: r.other_profile!
    })) ?? []

  const receivedProposals = normalizeProposals(receivedProposalsRaw)
  const sentProposals = normalizeProposals(sentProposalsRaw)

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
      events={eventsData ?? []}
      receivedConnections={receivedConnections}
      receivedConnectionsCount={receivedCount ?? 0}
      sentConnections={sentConnections}
      sentConnectionsCount={sentCount ?? 0}
      mutualIds={mutualIds}
      receivedProposals={receivedProposals}
      receivedProposalsCount={receivedProposalsCount ?? 0}
      sentProposals={sentProposals}
      sentProposalsCount={sentProposalsCount ?? 0}
      lastActivityAt={lastActivityAt}
      country={(profile?.country as string | null) ?? null}
      state={(profile?.state as string | null) ?? null}
      city={(profile?.city as string | null) ?? null}
    />
  )
}

import { getFeaturedCandidates, getProfileFeaturedSongs } from '@/lib/supabase/featured-songs'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { Role } from '@/lib/types'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import OwnProfileView from './_components/OwnProfileView'
import { markReceivedProposalsAsSeen } from './actions'
import { ROLE_TABLE } from './_components/profile-constants'

export const metadata: Metadata = {
  title: 'Mi perfil',
  description: 'Tu perfil en Ruidozo MX.',
  robots: { index: false, follow: false }
}

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ debug_uid?: string }> }) {
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

  // Debug helper: pass ?debug_uid=<slug-or-uuid> to impersonate another profile
  // for testing. Allowed on local dev and Vercel *preview* deployments, but
  // NEVER on production (ruidozo.mx). Vercel sets VERCEL_ENV per deployment.
  const debugAllowed = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'
  const { debug_uid } = await searchParams
  const isDebug = debugAllowed && !!debug_uid
  const profileId = isDebug ? debug_uid! : ((profile?.id as string) ?? user.id)

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
  const resolvedProfileId = isDebug ? ((profile?.id as string) ?? user.id) : profileId

  // The inbox tables (interests, user_proposals) are RLS-scoped to the *real*
  // logged-in user, so when impersonating another profile via ?debug_uid the
  // reads come back empty. In debug mode only (dev/preview, never production)
  // use the service client — which bypasses RLS — for those reads.
  const dataClient = isDebug ? createServiceClient() : supabase

  const displayName =
    (profile?.display_name as string) || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuario'
  const role = (profile?.role as Role) || (user.user_metadata?.role as Role) || null
  const location = [profile?.city, profile?.country].filter(Boolean).join(', ')
  const photoUrl = profile?.photo_url as string | null
  const socialLinks = (profile?.social_links as Record<string, string>) || null
  const bio = profile?.bio as string | null

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
  const lastActivityAt = profile?.last_activity_at as string | null

  // Mark inbound proposals as seen before reading them. Tracked for future
  // unread-state UX; doesn't gate rendering today.
  await markReceivedProposalsAsSeen()

  const CONNECTIONS_SHOWN = 5
  // `!inner` makes the join an INNER JOIN at the PostgREST layer, so rows
  // pointing to soft-deleted (or otherwise RLS-hidden) profiles drop out of
  // both the data and the `count`. Without this, the count badge would show
  // (N) while the rendered list came back empty.
  const CONNECTION_SELECT =
    'id, message, created_at, other_profile:profiles!{FK}!inner(id, slug, display_name, role, photo_url)'
  const PROPOSAL_SELECT =
    'id, message, status, created_at, responded_at, other_profile:profiles!{FK}!inner(id, slug, display_name, role, photo_url)'

  // `event_date` is a `date` column (no time, no timezone). Compare against
  // today as a YYYY-MM-DD string so a same-day event stays visible all day.
  const todayDate = new Date().toISOString().slice(0, 10)

  const [
    { data: songProposalsData },
    { count: songProposalsCount },
    { data: eventsData },
    { data: receivedRaw, count: receivedCount },
    { data: sentRaw, count: sentCount },
    { data: receivedProposalsRaw, count: receivedProposalsCount },
    { data: sentProposalsRaw, count: sentProposalsCount }
  ] = await Promise.all([
    supabase
      .from('song_proposals')
      .select('id, title, artist, status, created_at')
      .eq('user_id', resolvedProfileId)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('song_proposals').select('*', { count: 'exact', head: true }).eq('user_id', resolvedProfileId),
    supabase
      .from('events')
      .select('id, title, event_date, event_type, venue_name, city, address, description, external_link, status')
      .eq('profile_id', resolvedProfileId)
      .neq('status', 'cancelled')
      .gte('event_date', todayDate)
      .order('event_date', { ascending: true })
      .limit(5),
    dataClient
      .from('interests')
      .select(CONNECTION_SELECT.replace('{FK}', 'from_profile_id'), { count: 'exact' })
      .eq('to_profile_id', resolvedProfileId)
      .order('created_at', { ascending: false })
      .limit(CONNECTIONS_SHOWN),
    dataClient
      .from('interests')
      .select(CONNECTION_SELECT.replace('{FK}', 'to_profile_id'), { count: 'exact' })
      .eq('from_profile_id', resolvedProfileId)
      .order('created_at', { ascending: false })
      .limit(CONNECTIONS_SHOWN),
    dataClient
      .from('user_proposals')
      .select(PROPOSAL_SELECT.replace('{FK}', 'from_profile_id'), { count: 'exact' })
      .eq('to_profile_id', resolvedProfileId)
      .order('created_at', { ascending: false })
      .limit(CONNECTIONS_SHOWN),
    dataClient
      .from('user_proposals')
      .select(PROPOSAL_SELECT.replace('{FK}', 'to_profile_id'), { count: 'exact' })
      .eq('from_profile_id', resolvedProfileId)
      .order('created_at', { ascending: false })
      .limit(CONNECTIONS_SHOWN)
  ])

  // Lightweight ID-only queries to compute the mutual set (intersection of
  // "people who connected with me" and "people I connected with"). Inner-join
  // profiles so IDs pointing to inactive accounts don't enter the set (which
  // would otherwise tag invisible counterparts as "mutual" if they ever came
  // back).
  const [{ data: incomingIds }, { data: outgoingIds }] = await Promise.all([
    dataClient
      .from('interests')
      .select('from_profile_id, profile:profiles!from_profile_id!inner(id)')
      .eq('to_profile_id', resolvedProfileId),
    dataClient
      .from('interests')
      .select('to_profile_id, profile:profiles!to_profile_id!inner(id)')
      .eq('from_profile_id', resolvedProfileId)
  ])
  const incomingSet = new Set((incomingIds ?? []).map(r => r.from_profile_id as string))
  const mutualIds = (outgoingIds ?? []).map(r => r.to_profile_id as string).filter(id => incomingSet.has(id))

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
    (rows as RawInterest[] | null)
      ?.filter(r => r.other_profile)
      .map(r => ({
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
    (rows as RawProposal[] | null)
      ?.filter(r => r.other_profile)
      .map(r => ({
        id: r.id,
        message: r.message,
        status: r.status,
        created_at: r.created_at,
        responded_at: r.responded_at,
        otherProfile: r.other_profile!
      })) ?? []

  const receivedProposals = normalizeProposals(receivedProposalsRaw)
  const sentProposals = normalizeProposals(sentProposalsRaw)

  // Bands curate up to 3 rolas to feature on their public profile. Load the
  // candidate pool (own proposals + linked cassette tracks) and the current pick.
  let featuredCandidates: Awaited<ReturnType<typeof getFeaturedCandidates>> = []
  let featuredSongs: Awaited<ReturnType<typeof getProfileFeaturedSongs>> = []
  let featuredSelected: string[] = []
  if (role === 'banda') {
    const [candidates, current] = await Promise.all([
      getFeaturedCandidates(dataClient, resolvedProfileId),
      getProfileFeaturedSongs(dataClient, resolvedProfileId)
    ])
    featuredCandidates = candidates
    featuredSongs = current
    featuredSelected = current.map(s => s.key)
  }

  return (
    <OwnProfileView
      displayName={displayName}
      role={role}
      location={location}
      photoUrl={photoUrl}
      bio={bio || undefined}
      contact={contact}
      socialLinks={socialLinks}
      roleProfile={roleProfile}
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
      profileId={resolvedProfileId}
      featuredSongs={featuredSongs}
      featuredCandidates={featuredCandidates}
      featuredSelected={featuredSelected}
    />
  )
}

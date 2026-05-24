'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { LOOPS_IDS, sendTransactional } from '@/lib/loops'
import type { Role, UserProposalType } from '@/lib/types'
import { revalidatePath } from 'next/cache'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ruidozo.mx'

interface SendProposalInput {
  toProfileId: string
  message: string
}

export async function sendProposal(input: SendProposalInput) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  if (user.id === input.toProfileId) {
    return { error: 'No puedes enviarte una propuesta a ti mismo.' }
  }

  if (!input.message.trim()) {
    return { error: 'El mensaje no puede estar vacío.' }
  }

  const { error } = await supabase.from('user_proposals').insert({
    from_profile_id: user.id,
    to_profile_id: input.toProfileId,
    type: 'general' as UserProposalType,
    message: input.message.trim(),
    status: 'pending'
  })

  if (error) {
    console.error('Error saving proposal:', error)
    return { error: 'No se pudo enviar la propuesta. Intenta de nuevo.' }
  }

  return { success: true }
}

interface SendInterestInput {
  toProfileId: string
  motivo: string
}

export async function sendInterest(input: SendInterestInput) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  if (user.id === input.toProfileId) {
    return { error: 'No puedes conectar contigo mismo.' }
  }

  if (!input.motivo.trim()) {
    return { error: 'Selecciona un motivo.' }
  }

  const { error } = await supabase.from('interests').insert({
    from_profile_id: user.id,
    to_profile_id: input.toProfileId,
    message: input.motivo.trim()
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya enviaste una solicitud de conexión a este perfil.' }
    }
    console.error('Error saving interest:', error)
    return { error: 'No se pudo enviar la conexión. Intenta de nuevo.' }
  }

  const adminClient = createServiceClient()
  const { data: recipient } = await adminClient.auth.admin.getUserById(input.toProfileId)
  const recipientEmail = recipient?.user?.email

  if (recipientEmail) {
    const { data: senderProfile } = await supabase.from('profiles').select('slug').eq('id', user.id).single()

    const profileUrl = senderProfile?.slug ? `${SITE_URL}/perfil/${senderProfile.slug}` : SITE_URL

    await sendTransactional({
      transactionalId: LOOPS_IDS.INTEREST_RECEIVED,
      email: recipientEmail,
      dataVariables: {
        profile: profileUrl
      }
    })
  }

  return { success: true }
}

// ── Song Proposals ──

interface SubmitSongProposalInput {
  title: string
  artist: string
  externalLink?: string
  vibes?: string[]
}

function getStartOfWeek(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1 // Monday = start of week
  const start = new Date(now)
  start.setDate(now.getDate() - diff)
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

export async function submitSongProposal(input: SubmitSongProposalInput) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  if (!input.title.trim()) {
    return { error: 'El nombre de la rola es obligatorio.' }
  }

  if (!input.artist.trim()) {
    return { error: 'El nombre de la banda/proyecto es obligatorio.' }
  }

  // Check weekly limit (3 per calendar week)
  const { count } = await supabase
    .from('song_proposals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', getStartOfWeek())

  if (count !== null && count >= 3) {
    return { error: 'Ya alcanzaste tu límite de 3 propuestas esta semana.' }
  }

  const { error } = await supabase.from('song_proposals').insert({
    user_id: user.id,
    title: input.title.trim(),
    artist: input.artist.trim(),
    external_link: input.externalLink?.trim() || null,
    comment: input.vibes?.length ? input.vibes.join(' / ') : null,
    status: 'pending'
  })

  if (error) {
    console.error('Error saving song proposal:', error)
    return { error: 'No se pudo enviar la propuesta. Intenta de nuevo.' }
  }

  // Confirmation email — same template the legacy /proponer-rola form uses.
  // Fire-and-forget: a Loops outage shouldn't break the proposal flow.
  if (user.email) {
    await sendTransactional({
      transactionalId: LOOPS_IDS.PROPOSAL_SUBMITTED,
      email: user.email
    })
  }

  return { success: true }
}

// ── Events ──

interface SubmitEventInput {
  /** Free-form type label ("Tocada" / "Convocatoria" / "Fecha disponible"). */
  type: string
  title: string
  venueName?: string
  city?: string
  address?: string
  /** ISO date string from a `<input type="date">` (YYYY-MM-DD). */
  date: string
  description?: string
  externalLink?: string
}

export async function submitEvent(input: SubmitEventInput) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  if (!input.title.trim()) {
    return { error: 'El nombre del evento es obligatorio.' }
  }
  if (!input.type.trim()) {
    return { error: 'El tipo de evento es obligatorio.' }
  }
  if (!input.date) {
    return { error: 'La fecha del evento es obligatoria.' }
  }

  // Parse the date — `<input type="date">` returns YYYY-MM-DD which JS reads
  // as midnight UTC. That's fine for now; we keep it as a single timestamp.
  const eventDate = new Date(input.date)
  if (Number.isNaN(eventDate.getTime())) {
    return { error: 'La fecha no es válida.' }
  }

  const { error } = await supabase.from('events').insert({
    profile_id: user.id,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    event_date: eventDate.toISOString(),
    venue_name: input.venueName?.trim() || null,
    address: input.address?.trim() || null,
    city: input.city?.trim() || null,
    event_type: input.type.trim(),
    external_link: input.externalLink?.trim() || null,
    status: 'draft' // starts as draft until reviewed/published
  })

  if (error) {
    console.error('Error saving event:', error)
    return { error: 'No se pudo enviar el evento. Intenta de nuevo.' }
  }

  return { success: true }
}

const INDUSTRY_ROLES: readonly Role[] = ['manager', 'promotor', 'agente']
const ROLE_DETAIL_TABLE: Record<Role, string | null> = {
  banda: 'band_profiles',
  fan: 'fan_profiles',
  manager: 'industry_profiles',
  promotor: 'industry_profiles',
  agente: 'industry_profiles',
  proveedor: 'provider_profiles',
  venue: 'venue_profiles',
  admin: null
}

function getStr(formData: FormData, key: string): string | null {
  const v = formData.get(key) as string | null
  return v?.trim() || null
}

function getBool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'true'
}

function getArray(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map(v => String(v).trim())
    .filter(Boolean)
}

function buildSocialLinks(formData: FormData): Record<string, string> {
  const links: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') continue
    if (!key.startsWith('social_')) continue
    const platform = key.slice('social_'.length)
    if (!platform) continue
    const url = value.trim()
    if (url) links[platform] = url
  }
  const project = getStr(formData, 'project_link')
  if (project) links.project = project
  const web = getStr(formData, 'web_link')
  if (web) links.web = web
  return links
}

async function uploadPhotoBase64(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  photoData: string
): Promise<string | null> {
  if (!photoData || !photoData.startsWith('data:')) return null
  const match = photoData.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) return null
  const mimeType = match[1]
  const ext = mimeType === 'image/webp' ? 'webp' : mimeType === 'image/png' ? 'png' : 'jpg'
  const buffer = Buffer.from(match[2], 'base64')
  const filePath = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, { contentType: mimeType, upsert: true })
  if (error) return null
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}

export async function updateOwnProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  // Lock the role to whatever's already in the DB — editing the profile
  // never changes the user's role. Industry sub-roles may be changed
  // between manager/promotor/agente via the role_type field.
  const { data: existing } = await supabase
    .from('profiles')
    .select('role, slug, photo_url, social_links')
    .eq('id', user.id)
    .single()

  if (!existing) {
    return { error: 'No se encontró tu perfil.' }
  }

  const currentRole = existing.role as Role
  let nextRole = currentRole
  if (INDUSTRY_ROLES.includes(currentRole)) {
    const roleType = (getStr(formData, 'role_type') ?? currentRole) as Role
    if (INDUSTRY_ROLES.includes(roleType)) nextRole = roleType
  }

  const displayName = getStr(formData, 'display_name')
  if (!displayName) {
    return { error: 'El nombre no puede estar vacío.' }
  }

  const photoData = getStr(formData, 'photo_data')
  let photoUrl: string | null = (existing.photo_url as string | null) ?? null
  if (photoData) {
    const uploaded = await uploadPhotoBase64(supabase, user.id, photoData)
    if (uploaded) photoUrl = uploaded
  }

  const bio = getStr(formData, 'bio')
  const contact = getStr(formData, 'contact')
  const country = getStr(formData, 'country')
  const state = getStr(formData, 'state')
  const city = getStr(formData, 'city')
  const socialLinks = buildSocialLinks(formData)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role: nextRole,
      display_name: displayName,
      photo_url: photoUrl,
      bio,
      country,
      state,
      city,
      social_links: socialLinks,
      contact,
      onboarding_complete: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('[updateOwnProfile] profile update error:', profileError)
    return { error: 'No se pudo guardar tu perfil. Intenta de nuevo.' }
  }

  const detailTable = ROLE_DETAIL_TABLE[nextRole]
  if (detailTable) {
    const payload = buildRoleDetailPayload(nextRole, user.id, formData)
    if (payload) {
      const { error: detailError } = await supabase.from(detailTable).upsert(payload)
      if (detailError) {
        console.error('[updateOwnProfile] role detail upsert error:', detailError)
        return { error: 'No se pudieron guardar los datos del rol. Intenta de nuevo.' }
      }
    }
  }

  revalidatePath('/perfil')
  if (existing.slug) {
    revalidatePath(`/perfil/${existing.slug}`)
  }
  revalidatePath('/comunidad')

  return { success: true }
}

function buildRoleDetailPayload(role: Role, userId: string, formData: FormData): Record<string, unknown> | null {
  switch (role) {
    case 'banda':
      return {
        profile_id: userId,
        genre: getStr(formData, 'genre'),
        available_live: getBool(formData, 'available_live'),
        open_collabs: getBool(formData, 'open_collabs'),
        available_tours: getBool(formData, 'available_tours'),
        willing_travel: getBool(formData, 'willing_travel'),
        publish_dates: getBool(formData, 'publish_dates'),
        accept_proposals: getBool(formData, 'accept_proposals')
      }
    case 'fan':
      return {
        profile_id: userId,
        alias: getStr(formData, 'alias') ?? '',
        favorite_genres: getArray(formData, 'favorite_genres'),
        notify_new_bands: getBool(formData, 'notify_new_bands'),
        propose_fav_bands: getBool(formData, 'propose_fav_bands')
      }
    case 'manager':
    case 'promotor':
    case 'agente':
      return {
        profile_id: userId,
        represents_artists: getBool(formData, 'represents_artists'),
        artists_represented: getStr(formData, 'artists_represented'),
        seeks_emerging_talent: getBool(formData, 'seeks_emerging_talent'),
        promote_bands_ruidozo: getBool(formData, 'promote_bands_ruidozo'),
        organizes_events: getBool(formData, 'organizes_events'),
        event_types: getArray(formData, 'event_types'),
        provide_events_ruidozo: getBool(formData, 'provide_events_ruidozo'),
        seeks_talent: getBool(formData, 'seeks_talent'),
        represents_artists_live: getBool(formData, 'represents_artists_live'),
        seeks_new_projects: getBool(formData, 'seeks_new_projects'),
        territorial_reach: getArray(formData, 'territorial_reach'),
        accept_proposals: getBool(formData, 'accept_proposals')
      }
    case 'proveedor':
      return {
        profile_id: userId,
        service_types: getArray(formData, 'service_types'),
        territorial_reach: getArray(formData, 'territorial_reach'),
        works_emerging_projects: getBool(formData, 'works_emerging_projects'),
        publish_services: getBool(formData, 'publish_services'),
        accept_proposals: getBool(formData, 'accept_proposals')
      }
    case 'venue':
      return {
        profile_id: userId,
        capacity: getStr(formData, 'capacity'),
        venue_type: getArray(formData, 'venue_type'),
        has_audio: getBool(formData, 'has_audio'),
        has_lighting: getBool(formData, 'has_lighting'),
        accepts_indie_proposals: getBool(formData, 'accepts_indie_proposals'),
        publish_calls_ruidozo: getBool(formData, 'publish_calls_ruidozo')
      }
    case 'admin':
      return null
  }
}

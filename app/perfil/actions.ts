'use server'

import { logEvent } from '@/app/analytics/actions'
import { audioMetaError, extractStorageKey, proposalStorageKey, SONGS_BUCKET } from '@/lib/audio'
import { checkProposalSlots } from '@/lib/supabase/proposals'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendMail } from '@/lib/email'
import { LOOPS_IDS, sendTransactional } from '@/lib/loops'
import { buildLinkHref } from '@/lib/social-links'
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

  // Block if there's already a pending proposal from this sender to this
  // receiver — keeps the inbox honest and avoids spam. Resolved proposals
  // (accepted/rejected/withdrawn) don't block a follow-up.
  const { data: existing } = await supabase
    .from('user_proposals')
    .select('id')
    .eq('from_profile_id', user.id)
    .eq('to_profile_id', input.toProfileId)
    .eq('status', 'pending')
    .limit(1)
    .maybeSingle()

  if (existing) {
    return { error: 'Ya tienes una propuesta pendiente con este perfil. Espera respuesta o retírala.' }
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
    return { error: 'No pudimos enviar tu propuesta. Revisa tu conexión y vuelve a intentar en un momento.' }
  }

  // Notify the recipient. Reuses the INTEREST_RECEIVED Loops template for
  // now — its `profile` variable still points at the sender's URL.
  const adminClient = createServiceClient()
  const { data: recipient } = await adminClient.auth.admin.getUserById(input.toProfileId)
  const recipientEmail = recipient?.user?.email

  if (!recipientEmail) {
    console.error('[proposal] no recipient email', { toProfileId: input.toProfileId })
  } else {
    const { data: senderProfile } = await supabase.from('profiles').select('slug').eq('id', user.id).single()
    const profileUrl = senderProfile?.slug ? `${SITE_URL}/perfil/${senderProfile.slug}` : SITE_URL

    const result = await sendTransactional({
      transactionalId: LOOPS_IDS.INTEREST_RECEIVED,
      email: recipientEmail,
      dataVariables: {
        profile: profileUrl
      }
    })
    if (!result.ok) {
      console.error('[proposal] email failed', { toProfileId: input.toProfileId, error: result.error })
    }
  }

  return { success: true }
}

interface RespondToProposalInput {
  proposalId: string
  status: 'accepted' | 'rejected'
}

export async function respondToProposal(input: RespondToProposalInput) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  const { error } = await supabase
    .from('user_proposals')
    .update({
      status: input.status,
      responded_at: new Date().toISOString()
    })
    .eq('id', input.proposalId)
    .eq('to_profile_id', user.id) // belt-and-suspenders; RLS also enforces this
    .eq('status', 'pending')

  if (error) {
    console.error('Error responding to proposal:', error)
    return { error: 'No se pudo guardar la respuesta.' }
  }

  revalidatePath('/perfil')
  return { success: true }
}

interface WithdrawProposalInput {
  proposalId: string
}

export async function withdrawProposal(input: WithdrawProposalInput) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  // Only allow deletion while still pending — once responded, the sender
  // can't erase the record on the receiver's side.
  const { error } = await supabase
    .from('user_proposals')
    .delete()
    .eq('id', input.proposalId)
    .eq('from_profile_id', user.id)
    .eq('status', 'pending')

  if (error) {
    console.error('Error withdrawing proposal:', error)
    return { error: 'No se pudo retirar la propuesta.' }
  }

  revalidatePath('/perfil')
  return { success: true }
}

export async function markReceivedProposalsAsSeen() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('user_proposals')
    .update({ seen_at: new Date().toISOString() })
    .eq('to_profile_id', user.id)
    .is('seen_at', null)
}

interface SendInterestInput {
  toProfileId: string
  motivo: string
  songId?: string | null
  cassetteId?: string | null
  sessionId?: string | null
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

  await logEvent({
    type: 'interest_click',
    songId: input.songId ?? null,
    cassetteId: input.cassetteId ?? null,
    sessionId: input.sessionId ?? null,
    metadata: { target_profile_id: input.toProfileId, motivo: input.motivo.trim() }
  })

  const adminClient = createServiceClient()
  const { data: recipient } = await adminClient.auth.admin.getUserById(input.toProfileId)
  const recipientEmail = recipient?.user?.email

  if (!recipientEmail) {
    console.error('[interest] no recipient email', { toProfileId: input.toProfileId })
  } else {
    const { data: senderProfile } = await supabase.from('profiles').select('slug').eq('id', user.id).single()

    const profileUrl = senderProfile?.slug ? `${SITE_URL}/perfil/${senderProfile.slug}` : SITE_URL

    const result = await sendTransactional({
      transactionalId: LOOPS_IDS.INTEREST_RECEIVED,
      email: recipientEmail,
      dataVariables: {
        profile: profileUrl
      }
    })
    if (!result.ok) {
      console.error('[interest] email failed', { toProfileId: input.toProfileId, error: result.error })
    }
  }

  return { success: true }
}

interface WithdrawInterestInput {
  toProfileId: string
}

export async function withdrawInterest(input: WithdrawInterestInput) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  const { error } = await supabase
    .from('interests')
    .delete()
    .eq('from_profile_id', user.id)
    .eq('to_profile_id', input.toProfileId)

  if (error) {
    console.error('Error withdrawing interest:', error)
    return { error: 'No se pudo retirar la conexión.' }
  }

  revalidatePath('/perfil')
  return { success: true }
}

// ── Song Proposals ──

interface SubmitSongProposalInput {
  title: string
  artist: string
  externalLink?: string
  downloadLink?: string
  /** Public URL of the MP3 already uploaded to the `songs` bucket. */
  audioUrl?: string
  /** true when the proposer confirmed rights over the attached MP3 (own material only). */
  rightsAccepted?: boolean
  vibes?: string[]
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

  // The MP3 is optional here (this modal also serves recommending another
  // band's rola). When provided, it must be a file already uploaded to our
  // bucket — otherwise ignore it so the field can't point at an arbitrary URL.
  let audioUrl = input.audioUrl?.trim() || ''
  if (audioUrl && !extractStorageKey(audioUrl, SONGS_BUCKET)) audioUrl = ''

  const slots = await checkProposalSlots(supabase, user.id)
  if (slots.full) {
    return { error: slots.message!, kind: 'limit' as const }
  }

  const { error } = await supabase.from('song_proposals').insert({
    user_id: user.id,
    title: input.title.trim(),
    artist: input.artist.trim(),
    external_link: input.externalLink?.trim() || null,
    download_link: input.downloadLink?.trim() || null,
    audio_url: audioUrl || null,
    rights_accepted: input.rightsAccepted ? true : null,
    comment: input.vibes?.length ? input.vibes.join(' / ') : null,
    status: 'pending'
  })

  if (error) {
    console.error('Error saving song proposal:', error)
    // 23505 = unique violation: same user already proposed this exact
    // (title, artist). Reintentar nunca va a funcionar, así que lo decimos claro.
    if (error.code === '23505') {
      return {
        error: 'Ya habías propuesto esta rola. Si quieres mandar otra, cambia el nombre o la banda.',
        kind: 'duplicate' as const
      }
    }
    return { error: 'No pudimos guardar tu propuesta. Revisa tu conexión y vuelve a intentar en un momento.' }
  }

  // Confirmation email — same template the legacy /proponer-rola form uses.
  // Fire-and-forget: a Loops outage shouldn't break the proposal flow.
  if (user.email) {
    const result = await sendTransactional({
      transactionalId: LOOPS_IDS.PROPOSAL_SUBMITTED,
      email: user.email
    })
    if (!result.ok) {
      console.error('[song-proposal] email failed', { userId: user.id, error: result.error })
    }
  }

  return { success: true }
}

interface PrepareProposalAudioInput {
  proposalId: string
  fileName: string
  fileType: string
  fileSize: number
}

/**
 * Mint a signed upload URL so the owner can attach an MP3 to one of their
 * existing proposals that has none yet (e.g. recommended a rola without the
 * file, or it was created without audio). Mirrors the /proponer-rola flow but
 * keyed by an existing proposal instead of the weekly-limit gate. Pair with
 * saveProposalAudio once the browser finishes the upload.
 */
export async function prepareProposalAudioUpload(
  input: PrepareProposalAudioInput
): Promise<{ ok: true; key: string; token: string; publicUrl: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No has iniciado sesión.' }

  const metaError = audioMetaError(input.fileName, input.fileType, input.fileSize)
  if (metaError) return { ok: false, error: metaError }

  const { data: proposal } = await supabase
    .from('song_proposals')
    .select('user_id, artist, title, audio_url, deleted_at')
    .eq('id', input.proposalId)
    .single()

  if (!proposal || proposal.user_id !== user.id || proposal.deleted_at) {
    return { ok: false, error: 'No encontramos esa propuesta.' }
  }
  if (proposal.audio_url && extractStorageKey(proposal.audio_url, SONGS_BUCKET)) {
    return { ok: false, error: 'Esta rola ya tiene un MP3.' }
  }

  const svc = createServiceClient()
  const ext = (input.fileName.split('.').pop() ?? 'mp3').toLowerCase()
  const key = proposalStorageKey({
    userId: user.id,
    artist: proposal.artist || 'banda',
    title: proposal.title || 'rola',
    ext,
    rand: crypto.randomUUID().slice(0, 8)
  })

  const { data, error } = await svc.storage.from(SONGS_BUCKET).createSignedUploadUrl(key, { upsert: true })
  if (error || !data) return { ok: false, error: error?.message ?? 'No se pudo preparar la subida.' }

  const {
    data: { publicUrl }
  } = svc.storage.from(SONGS_BUCKET).getPublicUrl(key)

  return { ok: true, key, token: data.token, publicUrl }
}

/**
 * Persist the `audio_url` after the browser uploaded the MP3 to the `songs`
 * bucket. Verifies ownership in code and writes via the service client — there
 * is no owner-level UPDATE policy on song_proposals (only admins), and this
 * keeps the writable surface to just `audio_url` (+ `rights_accepted` when
 * the caller passes it — omitted entirely for callers that don't collect it,
 * e.g. the quick "+ MP3" pill, so it's never overwritten to null there).
 */
export async function saveProposalAudio(input: { proposalId: string; audioUrl: string; rightsAccepted?: boolean }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No has iniciado sesión.' }

  const audioUrl = input.audioUrl?.trim() || ''
  if (!audioUrl || !extractStorageKey(audioUrl, SONGS_BUCKET)) {
    return { error: 'El MP3 no es válido.' }
  }

  const { data: proposal } = await supabase
    .from('song_proposals')
    .select('user_id, deleted_at')
    .eq('id', input.proposalId)
    .single()

  if (!proposal || proposal.user_id !== user.id || proposal.deleted_at) {
    return { error: 'No encontramos esa propuesta.' }
  }

  const svc = createServiceClient()
  const { error } = await svc
    .from('song_proposals')
    .update({
      audio_url: audioUrl,
      ...(input.rightsAccepted !== undefined ? { rights_accepted: input.rightsAccepted ? true : null } : {})
    })
    .eq('id', input.proposalId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[saveProposalAudio]', error)
    return { error: 'No se pudo guardar el MP3. Intenta de nuevo.' }
  }

  // If the proposal was already accepted onto a cassette, point the cassette
  // track at the same file so the rola is playable there too. Non-fatal: the
  // proposal save already succeeded. Cassettes already glued by build-cassette
  // (concat_audio_url + offsets) need a rebuild before this is audible.
  const { data: linkedSongs } = await svc.from('songs').select('cassette_id').eq('proposal_id', input.proposalId)
  if (linkedSongs && linkedSongs.length > 0) {
    const { error: songError } = await svc
      .from('songs')
      .update({ audio_url: audioUrl })
      .eq('proposal_id', input.proposalId)
    if (songError) console.error('[saveProposalAudio] linked song update', songError)
    for (const cid of [...new Set(linkedSongs.map(s => s.cassette_id).filter(Boolean))]) {
      revalidatePath(`/admin/cassettes/${cid}`)
    }
    revalidatePath('/')
  }

  revalidatePath('/perfil')
  return { success: true }
}

interface UpdateSongProposalInput {
  id: string
  title: string
  artist: string
  externalLink?: string
  downloadLink?: string
  vibes?: string[]
}

/**
 * Edit the text fields of one's own proposal. Like saveProposalAudio, there is
 * no owner-level UPDATE policy on song_proposals — ownership and editability are
 * checked in code and the write goes through the service client with a narrow
 * column allow-list (never status / cassette_id / reviewed_*).
 */
export async function updateSongProposal(input: UpdateSongProposalInput) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No has iniciado sesión.' }

  if (!input.id) return { error: 'Propuesta no válida.' }
  if (!input.title.trim()) return { error: 'El nombre de la rola es obligatorio.' }
  if (!input.artist.trim()) return { error: 'El nombre de la banda/proyecto es obligatorio.' }

  const { data: proposal } = await supabase
    .from('song_proposals')
    .select('user_id, status, deleted_at')
    .eq('id', input.id)
    .single()

  if (!proposal || proposal.user_id !== user.id || proposal.deleted_at) {
    return { error: 'No encontramos esa propuesta.' }
  }
  // Once accepted the rola is on a cassette — its info is frozen.
  if (proposal.status === 'accepted') {
    return { error: 'Esta rola ya fue aceptada y no se puede editar.' }
  }

  const patch: Record<string, unknown> = {
    title: input.title.trim(),
    artist: input.artist.trim(),
    external_link: input.externalLink?.trim() || null,
    download_link: input.downloadLink?.trim() || null
  }
  // Vibes live in `comment`; only overwrite it when the modal managed them
  // (showVibes), so editing without the vibes UI doesn't wipe a note.
  if (input.vibes !== undefined) {
    patch.comment = input.vibes.length ? input.vibes.join(' / ') : null
  }

  const svc = createServiceClient()
  // `.neq('status', 'accepted')` re-checks editability at write time (guards the
  // gap between the read above and this update).
  const { error } = await svc
    .from('song_proposals')
    .update(patch)
    .eq('id', input.id)
    .eq('user_id', user.id)
    .neq('status', 'accepted')

  if (error) {
    console.error('[updateSongProposal]', error)
    if (error.code === '23505') {
      return { error: 'Ya tienes otra rola con ese nombre y banda. Cambia alguno para guardar.' }
    }
    return { error: 'No pudimos actualizar tu propuesta. Intenta de nuevo.' }
  }

  revalidatePath('/perfil')
  return { success: true }
}

/**
 * Free one of the band's 3 slots by removing a rola from its profile. Soft:
 * `songs.proposal_id` has no ON DELETE, so a real DELETE on an accepted proposal
 * fails on the FK — and admin/propuestas plus métricas would lose the history.
 * Same service-client + ownership-in-code pattern as updateSongProposal.
 */
export async function deleteSongProposal(input: { id: string }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No has iniciado sesión.' }

  if (!input.id) return { error: 'Propuesta no válida.' }

  const { data: proposal } = await supabase
    .from('song_proposals')
    .select('user_id, status, deleted_at')
    .eq('id', input.id)
    .single()

  if (!proposal || proposal.user_id !== user.id) {
    return { error: 'No encontramos esa rola.' }
  }
  if (proposal.deleted_at) return { success: true }
  // Accepted rolas live on the cassette — they already freed their slot, and
  // pulling one would leave a hole in a published tracklist.
  if (proposal.status === 'accepted') {
    return { error: 'Esta rola ya salió en un cassette y no se puede quitar.' }
  }

  const svc = createServiceClient()
  // `.neq('status', 'accepted')` re-checks at write time (guards the gap between
  // the read above and this update, e.g. an admin accepting it meanwhile).
  const { error } = await svc
    .from('song_proposals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', input.id)
    .eq('user_id', user.id)
    .neq('status', 'accepted')

  if (error) {
    console.error('[deleteSongProposal]', error)
    return { error: 'No pudimos quitar la rola. Intenta de nuevo.' }
  }

  revalidatePath('/perfil')
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

  // `<input type="date">` returns YYYY-MM-DD. The column is `date`, so we
  // store the string as-is — no parsing into a Date (which would shift the
  // value by the runtime's UTC offset).
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { error: 'La fecha no es válida.' }
  }

  const { error } = await supabase.from('events').insert({
    profile_id: user.id,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    event_date: input.date,
    venue_name: input.venueName?.trim() || null,
    address: input.address?.trim() || null,
    city: input.city?.trim() || null,
    event_type: input.type.trim(),
    external_link: input.externalLink?.trim() || null,
    status: 'published'
  })

  if (error) {
    console.error('Error saving event:', error)
    return { error: 'No se pudo enviar el evento. Intenta de nuevo.' }
  }

  revalidatePath('/perfil')
  return { success: true }
}

interface UpdateEventInput extends SubmitEventInput {
  id: string
}

export async function updateEvent(input: UpdateEventInput) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  if (!input.id) {
    return { error: 'Evento no válido.' }
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { error: 'La fecha no es válida.' }
  }

  // `.eq('profile_id', user.id)` mirrors the `events_update_own` RLS policy and
  // makes ownership explicit; `.select()` lets us tell "not yours" from a no-op.
  const { data, error } = await supabase
    .from('events')
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      event_date: input.date,
      venue_name: input.venueName?.trim() || null,
      address: input.address?.trim() || null,
      city: input.city?.trim() || null,
      event_type: input.type.trim(),
      external_link: input.externalLink?.trim() || null
    })
    .eq('id', input.id)
    .eq('profile_id', user.id)
    .select('id')

  if (error) {
    console.error('Error updating event:', error)
    return { error: 'No se pudo actualizar el evento. Intenta de nuevo.' }
  }
  if (!data || data.length === 0) {
    return { error: 'No se encontró el evento o no tienes permiso para editarlo.' }
  }

  revalidatePath('/perfil')
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
    if (url) links[platform] = buildLinkHref(platform, url)
  }
  const project = getStr(formData, 'project_link')
  if (project) links.project = buildLinkHref('project', project)
  const web = getStr(formData, 'web_link')
  if (web) links.web = buildLinkHref('web', web)
  return links
}

async function uploadPhotoBase64(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient>,
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
  // The path is fixed (`avatar.webp`, upserted), so the public URL never
  // changes between uploads — browsers/CDN keep serving the cached old image.
  // Append the upload time as a version param to bust that cache.
  return `${data.publicUrl}?v=${Date.now()}`
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

// ── Admin moderation actions ───────────────────────────────────────────────────
//
// Admins can edit and (soft-)delete any profile. The viewer's role is checked
// via the authenticated client (RLS-scoped) and writes go through the service
// client so they're not blocked by `*_update_own` policies.

async function getAdminUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function updateProfileAsAdmin(targetProfileId: string, formData: FormData) {
  const supabase = await createClient()
  const adminUser = await getAdminUser(supabase)
  if (!adminUser) {
    return { error: 'No tienes permisos para esta acción.' }
  }

  const serviceClient = createServiceClient()
  const { data: existing } = await serviceClient
    .from('profiles')
    .select('role, slug, photo_url')
    .eq('id', targetProfileId)
    .single()

  if (!existing) {
    return { error: 'Perfil no encontrado.' }
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
    const uploaded = await uploadPhotoBase64(serviceClient, targetProfileId, photoData)
    if (uploaded) photoUrl = uploaded
  }

  const { error: profileError } = await serviceClient
    .from('profiles')
    .update({
      role: nextRole,
      display_name: displayName,
      photo_url: photoUrl,
      bio: getStr(formData, 'bio'),
      country: getStr(formData, 'country'),
      state: getStr(formData, 'state'),
      city: getStr(formData, 'city'),
      social_links: buildSocialLinks(formData),
      contact: getStr(formData, 'contact'),
      updated_at: new Date().toISOString()
    })
    .eq('id', targetProfileId)

  if (profileError) {
    console.error('[updateProfileAsAdmin] profile update error:', profileError)
    return { error: 'No se pudo guardar el perfil. Intenta de nuevo.' }
  }

  const detailTable = ROLE_DETAIL_TABLE[nextRole]
  if (detailTable) {
    const payload = buildRoleDetailPayload(nextRole, targetProfileId, formData)
    if (payload) {
      const { error: detailError } = await serviceClient.from(detailTable).upsert(payload)
      if (detailError) {
        console.error('[updateProfileAsAdmin] role detail upsert error:', detailError)
        return { error: 'No se pudieron guardar los datos del rol. Intenta de nuevo.' }
      }
    }
  }

  if (existing.slug) {
    revalidatePath(`/perfil/${existing.slug}`)
  }
  revalidatePath('/comunidad')

  return { success: true }
}

export async function deleteProfileAsAdmin(targetProfileId: string) {
  const supabase = await createClient()
  const adminUser = await getAdminUser(supabase)
  if (!adminUser) {
    return { error: 'No tienes permisos para esta acción.' }
  }

  if (adminUser.id === targetProfileId) {
    return { error: 'No puedes eliminar tu propio perfil desde aquí.' }
  }

  const serviceClient = createServiceClient()
  const { data: existing } = await serviceClient.from('profiles').select('slug').eq('id', targetProfileId).single()

  if (!existing) {
    return { error: 'Perfil no encontrado.' }
  }

  // Soft delete — `active = false` removes the profile from public listings
  // (via the RLS `profiles_select_active` policy) without losing data.
  const { error } = await serviceClient
    .from('profiles')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', targetProfileId)

  if (error) {
    console.error('[deleteProfileAsAdmin]', error)
    return { error: 'No se pudo eliminar el perfil.' }
  }

  if (existing.slug) {
    revalidatePath(`/perfil/${existing.slug}`)
  }
  revalidatePath('/comunidad')

  return { success: true }
}

export async function confirmUserEmailAsAdmin(targetProfileId: string) {
  const supabase = await createClient()
  const adminUser = await getAdminUser(supabase)
  if (!adminUser) {
    return { error: 'No tienes permisos para esta acción.' }
  }

  const serviceClient = createServiceClient()

  // Verify the target exists and grab the slug for revalidation.
  const { data: existing } = await serviceClient.from('profiles').select('slug').eq('id', targetProfileId).single()
  if (!existing) {
    return { error: 'Perfil no encontrado.' }
  }

  const { error } = await serviceClient.auth.admin.updateUserById(targetProfileId, { email_confirm: true })
  if (error) {
    console.error('[confirmUserEmailAsAdmin]', error)
    return { error: 'No se pudo confirmar la cuenta.' }
  }

  if (existing.slug) {
    revalidatePath(`/perfil/${existing.slug}`)
  }

  return { success: true }
}

export async function resendConfirmationEmailAsAdmin(targetProfileId: string) {
  const supabase = await createClient()
  const adminUser = await getAdminUser(supabase)
  if (!adminUser) {
    return { error: 'No tienes permisos para esta acción.' }
  }

  const serviceClient = createServiceClient()
  const { data: targetAuth } = await serviceClient.auth.admin.getUserById(targetProfileId)
  const email = targetAuth?.user?.email
  if (!email) {
    return { error: 'No se encontró el email del usuario.' }
  }

  if (targetAuth.user?.email_confirmed_at) {
    return { error: 'La cuenta ya está confirmada.' }
  }

  // Trigger Supabase's signup confirmation email again via the public resend
  // endpoint. Uses the configured signup template — no app-level template
  // dependency.
  const { error } = await serviceClient.auth.resend({ type: 'signup', email })
  if (error) {
    console.error('[resendConfirmationEmailAsAdmin]', error)
    return { error: 'No se pudo reenviar el correo.' }
  }

  return { success: true }
}

/** Inbox that receives design-quote requests from the portfolio modal. */
const PORTFOLIO_INBOX = 'hola@ruidozo.mx'

interface PortfolioQuoteInput {
  /** Services ticked in the "¿Qué necesitas?" modal. */
  servicios: string[]
  message: string
}

/**
 * Sends a design-quote request from the "¿Qué necesitas?" modal to
 * hola@ruidozo.mx over plain SMTP. Requires a session — the modal only exists
 * on the private profile — so the requester's identity comes from the verified
 * user, never the client payload.
 */
export async function sendPortfolioQuote(input: PortfolioQuoteInput) {
  const servicios = (input.servicios ?? []).map(s => s.trim()).filter(Boolean)
  const message = input.message?.trim() ?? ''

  if (servicios.length === 0 && !message) {
    return { error: 'Selecciona al menos un servicio o cuéntanos sobre tu proyecto.' }
  }

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No has iniciado sesión.' }
  }

  // Service client, not the RLS-scoped one: this is the user's own row, keyed
  // by their verified id, so bypassing RLS here doesn't expose anyone else's
  // data — and it removes any dependence on the `active` flag for a read that
  // has nothing to do with visibility.
  const serviceClient = createServiceClient()
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    // `profiles` has no `contact_email` column (that name only exists in the
    // docs) — it's just `contact`, a free-text field also used on the
    // role-specific tables and not guaranteed to be an email address. Selecting
    // a nonexistent column makes PostgREST error the *entire* query, which is
    // why display_name/slug were ALSO coming back empty — not an RLS issue.
    .select('display_name, slug')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[portfolio-quote] profile lookup failed', { userId: user.id, error: profileError })
  }

  const remitente = profile?.display_name || 'Sin nombre'
  // The authenticated account's email — always present, unlike the free-text
  // `contact` field — so Reply-To is guaranteed a real address.
  const remitenteEmail = user.email || 'Sin email'
  const perfil = profile?.slug ? `${SITE_URL}/perfil/${profile.slug}` : SITE_URL

  // Persist the request — this row is what /admin/cotizaciones reads. The email
  // below is only the notification; the record is the source of truth.
  const svc = createServiceClient()
  const { error: insertError } = await svc.from('portfolio_quotes').insert({
    profile_id: user.id,
    requester_name: remitente !== 'Sin nombre' ? remitente : null,
    requester_email: remitenteEmail !== 'Sin email' ? remitenteEmail : null,
    servicios,
    message: message || null,
    status: 'pending'
  })
  if (insertError) {
    console.error('[portfolio-quote] insert failed', { userId: user.id, error: insertError })
  }

  const result = await sendMail({
    to: PORTFOLIO_INBOX,
    subject: `Nueva solicitud de cotización — ${remitente}`,
    // Shows the requester's name in the inbox; the address stays our own
    // mailbox (providers reject a From you don't own), and Reply-To sends
    // replies straight to the person who asked.
    fromName: `${remitente} (vía Ruidozo)`,
    replyTo: remitenteEmail !== 'Sin email' ? remitenteEmail : undefined,
    text: [
      'Nueva solicitud de cotización desde el perfil privado.',
      '',
      `Nombre:    ${remitente}`,
      `Email:     ${remitenteEmail}`,
      `Perfil:    ${perfil}`,
      '',
      `Servicios: ${servicios.length ? servicios.join(', ') : 'No especificado'}`,
      '',
      'Mensaje:',
      message || 'Sin mensaje'
    ].join('\n')
  })

  if (!result.ok) {
    console.error('[portfolio-quote] email failed', { userId: user.id, error: result.error })
    // Only fail the user if nothing landed anywhere. If the record saved, the
    // request is safe in /admin/cotizaciones even though the notice bounced.
    if (insertError) {
      return { error: 'No pudimos enviar tu solicitud. Intenta directo en hola@ruidozo.mx.' }
    }
  }

  revalidatePath('/admin/cotizaciones')
  return { success: true }
}

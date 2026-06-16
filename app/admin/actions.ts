'use server'

import { extractStorageKey, isPlayableAudio, songStorageKey } from '@/lib/audio'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const SONGS_BUCKET = 'songs'
const MAX_AUDIO_BYTES = 30 * 1024 * 1024 // 30 MB
const ALLOWED_AUDIO_MIME = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/mp4'])

// ─────────────────────────────────────────────────────────────────────────────
// Guard
// ─────────────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/iniciar-sesion?e=no_autorizado')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/')

  return user
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the cassette where new accepted proposals should land (is_next first, fallback active). */
async function getTargetCassette() {
  const svc = createServiceClient()

  const { data: nextOne } = await svc.from('cassettes').select('id, name').eq('is_next', true).maybeSingle()
  if (nextOne) return nextOne

  const { data: active } = await svc.from('cassettes').select('id, name').eq('active', true).maybeSingle()
  return active
}

function backWithError(path: string, code: string, msg?: string) {
  const params = new URLSearchParams({ e: code })
  if (msg) params.set('m', msg)
  redirect(`${path}?${params.toString()}`)
}

function backWithSuccess(path: string, code: string, msg?: string) {
  const params = new URLSearchParams({ ok: code })
  if (msg) params.set('m', msg)
  redirect(`${path}?${params.toString()}`)
}

/** Validates client-reported audio metadata before minting a signed upload URL. */
function audioMetaError(fileName: string, fileType: string, fileSize: number): string | null {
  if (!fileName) return 'faltan_datos'
  if (!Number.isFinite(fileSize) || fileSize <= 0) return 'archivo_vacio'
  if (fileSize > MAX_AUDIO_BYTES) return 'archivo_muy_grande'
  if (fileType && !ALLOWED_AUDIO_MIME.has(fileType)) return 'tipo_no_soportado'
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposals
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Accept a proposal: insert into the songs table for the "next" cassette
 * (or active if no next is set), then mark the proposal as selected.
 */
export async function acceptProposal(formData: FormData) {
  const user = await requireAdmin()
  const svc = createServiceClient()

  const proposalId = formData.get('proposal_id') as string
  const side = formData.get('side') as 'A' | 'B'
  const position = Number(formData.get('position'))

  if (!proposalId || !side || !position) {
    backWithError('/admin/propuestas', 'faltan_datos')
  }

  const target = await getTargetCassette()
  if (!target) {
    backWithError('/admin/propuestas', 'no_cassette_destino')
  }

  const { data: proposal } = await svc.from('song_proposals').select('*').eq('id', proposalId).single()
  if (!proposal) {
    backWithError('/admin/propuestas', 'generico', 'Propuesta no encontrada.')
  }
  if (proposal!.status !== 'pending') {
    backWithError('/admin/propuestas', 'ya_revisada')
  }

  const { error: songError } = await svc.from('songs').insert({
    cassette_id: target!.id,
    title: proposal!.title,
    artist: proposal!.artist,
    genre: proposal!.genre,
    side,
    position,
    audio_url: proposal!.external_link || proposal!.audio_file_path,
    proposal_id: proposal!.id
  })

  if (songError) {
    if (songError.code === '23505') {
      backWithError('/admin/propuestas', 'slot_ocupado')
    }
    backWithError('/admin/propuestas', 'generico', songError.message)
  }

  await svc
    .from('song_proposals')
    .update({
      status: 'accepted',
      cassette_id: target!.id,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq('id', proposalId)

  revalidatePath('/admin/propuestas')
  revalidatePath('/admin/cassettes')
  revalidatePath(`/admin/cassettes/${target!.id}`)
  backWithSuccess('/admin/propuestas', 'aceptada', `→ ${target!.name ?? 'Cassette'} · Lado ${side} · #${position}`)
}

/** Reject a proposal. If it was previously selected, also remove its song from the cassette. */
export async function rejectProposal(formData: FormData) {
  const user = await requireAdmin()
  const svc = createServiceClient()

  const proposalId = formData.get('proposal_id') as string
  if (!proposalId) backWithError('/admin/propuestas', 'faltan_datos')

  const { data: existing } = await svc.from('song_proposals').select('status').eq('id', proposalId).single()
  if (!existing) backWithError('/admin/propuestas', 'generico', 'Propuesta no encontrada.')

  if (existing!.status === 'accepted') {
    await svc.from('songs').delete().eq('proposal_id', proposalId)
  }

  await svc
    .from('song_proposals')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      cassette_id: null
    })
    .eq('id', proposalId)

  revalidatePath('/admin/propuestas')
  revalidatePath('/admin/cassettes')
  backWithSuccess('/admin/propuestas', 'rechazada')
}

/** Re-open a proposal (set back to pending). */
export async function reopenProposal(formData: FormData) {
  await requireAdmin()
  const svc = createServiceClient()

  const proposalId = formData.get('proposal_id') as string
  if (!proposalId) backWithError('/admin/propuestas', 'faltan_datos')

  await svc.from('songs').delete().eq('proposal_id', proposalId)

  await svc
    .from('song_proposals')
    .update({ status: 'pending', reviewed_at: null, reviewed_by: null, cassette_id: null })
    .eq('id', proposalId)

  revalidatePath('/admin/propuestas')
  revalidatePath('/admin/cassettes')
  backWithSuccess('/admin/propuestas', 'rechazada', 'Propuesta regresada a pendientes.')
}

// ─────────────────────────────────────────────────────────────────────────────
// Cassettes
// ─────────────────────────────────────────────────────────────────────────────

export async function createCassette(formData: FormData) {
  const user = await requireAdmin()
  const svc = createServiceClient()

  const name = (formData.get('name') as string)?.trim()
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const durationMinutes = Number(formData.get('duration_minutes')) || 90
  const curatorName = (formData.get('curator_name') as string)?.trim() || null
  const markAsNext = formData.get('mark_as_next') === 'on'

  if (!name || !startDate || !endDate) {
    backWithError('/admin/cassettes', 'faltan_datos')
  }

  const { data: created, error } = await svc
    .from('cassettes')
    .insert({
      name,
      start_date: startDate,
      end_date: endDate,
      duration_minutes: durationMinutes,
      curator_id: user.id,
      curator_name: curatorName,
      active: false,
      archived: false,
      is_next: false
    })
    .select('id')
    .single()

  if (error || !created) {
    backWithError('/admin/cassettes', 'generico', error?.message)
  }

  if (markAsNext) {
    await svc.rpc('set_next_cassette', { p_cassette_id: created!.id })
  }

  revalidatePath('/admin/cassettes')
  revalidatePath('/admin')
  redirect(`/admin/cassettes/${created!.id}?ok=cassette_creado`)
}

export async function publishCassette(formData: FormData) {
  await requireAdmin()
  const svc = createServiceClient()

  const cassetteId = formData.get('cassette_id') as string
  if (!cassetteId) backWithError('/admin/cassettes', 'faltan_datos')

  const { data: tracks } = await svc.from('songs').select('id, audio_url').eq('cassette_id', cassetteId)
  if (!tracks || tracks.length === 0) {
    backWithError(`/admin/cassettes/${cassetteId}`, 'cassette_vacio')
  }

  const missing = tracks!.filter(t => !isPlayableAudio(t.audio_url))
  if (missing.length > 0) {
    backWithError(
      `/admin/cassettes/${cassetteId}`,
      'audio_no_reproducible',
      `${missing.length} canci\u00f3n(es) sin MP3 reproducible. Sube el audio antes de publicar.`
    )
  }

  // The player streams a single concatenated file (built by `npm run build-cassette`).
  // Require it to exist and cover every song before publishing, so a cassette never
  // goes active without its audio (or with a stale offsets table that misses a song).
  const { data: target } = await svc
    .from('cassettes')
    .select('archived, concat_audio_url, song_offsets')
    .eq('id', cassetteId)
    .maybeSingle()

  const offsets = (target?.song_offsets as { song_id: string }[] | null) ?? []
  const offsetIds = new Set(offsets.map(o => o.song_id))
  const concatReady = Boolean(target?.concat_audio_url) && tracks!.every(t => offsetIds.has(t.id))
  if (!concatReady) {
    backWithError(
      `/admin/cassettes/${cassetteId}`,
      'audio_concat_faltante',
      `Falta generar el audio del cassette (o est\u00e1 desfasado). Corre: npm run build-cassette ${cassetteId}`
    )
  }

  // If the cassette was archived (e.g. we're reactivating an old one), unarchive
  // it first so the RPC can mark it active without violating the single-active
  // index. Safe even if the RPC also clears `archived` \u2014 UPDATEs are idempotent.
  if (target?.archived) {
    await svc.from('cassettes').update({ archived: false }).eq('id', cassetteId)
  }

  const { error } = await svc.rpc('publish_cassette', { p_cassette_id: cassetteId })
  if (error) backWithError(`/admin/cassettes/${cassetteId}`, 'generico', error.message)

  revalidatePath('/admin/cassettes')
  revalidatePath('/admin')
  revalidatePath('/')
  backWithSuccess(`/admin/cassettes/${cassetteId}`, 'cassette_publicado')
}

export async function setNextCassette(formData: FormData) {
  await requireAdmin()
  const svc = createServiceClient()

  const cassetteId = formData.get('cassette_id') as string
  if (!cassetteId) backWithError('/admin/cassettes', 'faltan_datos')

  const { data: cassette } = await svc.from('cassettes').select('active').eq('id', cassetteId).single()
  if (cassette?.active) {
    backWithError(`/admin/cassettes/${cassetteId}`, 'cassette_activo')
  }

  const { error } = await svc.rpc('set_next_cassette', { p_cassette_id: cassetteId })
  if (error) backWithError(`/admin/cassettes/${cassetteId}`, 'generico', error.message)

  revalidatePath('/admin/cassettes')
  revalidatePath('/admin/propuestas')
  revalidatePath('/admin')
  backWithSuccess(`/admin/cassettes/${cassetteId}`, 'marcado_siguiente')
}

export async function deleteCassette(formData: FormData) {
  await requireAdmin()
  const svc = createServiceClient()

  const cassetteId = formData.get('cassette_id') as string
  if (!cassetteId) backWithError('/admin/cassettes', 'faltan_datos')

  const { data: cassette } = await svc.from('cassettes').select('active').eq('id', cassetteId).single()
  if (cassette?.active) {
    backWithError('/admin/cassettes', 'generico', 'No puedes eliminar el cassette activo.')
  }

  await svc.from('song_proposals').update({ cassette_id: null }).eq('cassette_id', cassetteId)
  await svc.from('songs').delete().eq('cassette_id', cassetteId)
  const { error } = await svc.from('cassettes').delete().eq('id', cassetteId)
  if (error) backWithError('/admin/cassettes', 'generico', error.message)

  revalidatePath('/admin/cassettes')
  revalidatePath('/admin')
  backWithSuccess('/admin/cassettes', 'cassette_eliminado')
}

export async function updateSongDuration({
  songId,
  cassetteId,
  durationSeconds
}: {
  songId: string
  cassetteId: string
  durationSeconds: number | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()
  const svc = createServiceClient()

  if (!songId || !cassetteId) return { ok: false, error: 'faltan_datos' }
  if (
    durationSeconds !== null &&
    (!Number.isFinite(durationSeconds) || durationSeconds < 0 || durationSeconds > 36000)
  ) {
    return { ok: false, error: 'duracion_invalida' }
  }

  const value = durationSeconds === null ? null : Math.round(durationSeconds)
  const { error } = await svc.from('songs').update({ duration_seconds: value }).eq('id', songId)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/cassettes/${cassetteId}`)
  return { ok: true }
}

export async function removeSongFromCassette(formData: FormData) {
  await requireAdmin()
  const svc = createServiceClient()

  const songId = formData.get('song_id') as string
  const cassetteId = formData.get('cassette_id') as string
  if (!songId || !cassetteId) backWithError('/admin/cassettes', 'faltan_datos')

  const { data: song } = await svc.from('songs').select('proposal_id').eq('id', songId).single()
  if (song?.proposal_id) {
    await svc
      .from('song_proposals')
      .update({ status: 'pending', reviewed_at: null, reviewed_by: null, cassette_id: null })
      .eq('id', song.proposal_id)
  }
  await svc.from('songs').delete().eq('id', songId)

  revalidatePath(`/admin/cassettes/${cassetteId}`)
  revalidatePath('/admin/propuestas')
  backWithSuccess(`/admin/cassettes/${cassetteId}`, 'cancion_removida')
}

/**
 * Replace an accepted song's audio: mint a signed upload URL so the browser can
 * push the MP3 straight to the `songs` bucket (the file never travels through a
 * Server Action body, which caps at 5mb). Pair with {@link finalizeSongAudio}.
 */
export async function prepareSongAudioUpload(input: {
  songId: string
  cassetteId: string
  fileName: string
  fileType: string
  fileSize: number
}): Promise<{ ok: true; key: string; token: string } | { ok: false; error: string }> {
  await requireAdmin()
  const svc = createServiceClient()

  if (!input.songId || !input.cassetteId) return { ok: false, error: 'faltan_datos' }
  const metaError = audioMetaError(input.fileName, input.fileType, input.fileSize)
  if (metaError) return { ok: false, error: metaError }

  const { data: song } = await svc.from('songs').select('artist, title, cassette_id').eq('id', input.songId).single()
  if (!song) return { ok: false, error: 'cancion_no_encontrada' }
  if (song.cassette_id !== input.cassetteId) return { ok: false, error: 'cassette_mismatch' }

  const ext = (input.fileName.split('.').pop() ?? 'mp3').toLowerCase()
  const key = songStorageKey({ cassetteId: input.cassetteId, artist: song.artist, title: song.title, ext })

  const { data, error } = await svc.storage.from(SONGS_BUCKET).createSignedUploadUrl(key, { upsert: true })
  if (error || !data) return { ok: false, error: error?.message ?? 'no_se_pudo_preparar' }

  return { ok: true, key, token: data.token }
}

/** Point a song's `audio_url` at the file the browser just uploaded to `key`. */
export async function finalizeSongAudio(input: {
  songId: string
  cassetteId: string
  key: string
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin()
  const svc = createServiceClient()

  if (!input.songId || !input.cassetteId || !input.key) return { ok: false, error: 'faltan_datos' }
  if (!input.key.startsWith(`${input.cassetteId}/`)) return { ok: false, error: 'faltan_datos' }

  const { data: song } = await svc.from('songs').select('cassette_id').eq('id', input.songId).single()
  if (!song) return { ok: false, error: 'cancion_no_encontrada' }
  if (song.cassette_id !== input.cassetteId) return { ok: false, error: 'cassette_mismatch' }

  const {
    data: { publicUrl }
  } = svc.storage.from(SONGS_BUCKET).getPublicUrl(input.key)

  const { error: updateError } = await svc.from('songs').update({ audio_url: publicUrl }).eq('id', input.songId)
  if (updateError) return { ok: false, error: updateError.message }

  revalidatePath(`/admin/cassettes/${input.cassetteId}`)
  revalidatePath('/')
  return { ok: true, url: publicUrl }
}

/**
 * Search active band profiles by display name for the admin "add song" picker.
 * Returns up to 8 matches. Used by the autocomplete in AddSongModal so admins
 * can optionally link a manually uploaded track to a registered band.
 */
export async function searchBandasByName(
  query: string
): Promise<{ ok: true; results: { id: string; displayName: string; slug: string; photoUrl: string | null }[] }> {
  await requireAdmin()
  const svc = createServiceClient()

  const trimmed = query.trim()
  if (trimmed.length < 2) return { ok: true, results: [] }

  // ILIKE pattern: escape % and _ so the user's literal text matches as typed.
  const escaped = trimmed.replace(/[\\%_]/g, c => `\\${c}`)

  const { data } = await svc
    .from('profiles')
    .select('id, display_name, slug, photo_url')
    .eq('role', 'banda')
    .eq('active', true)
    .ilike('display_name', `%${escaped}%`)
    .order('display_name', { ascending: true })
    .limit(8)

  return {
    ok: true,
    results: (data ?? []).map(p => ({
      id: p.id,
      displayName: p.display_name,
      slug: p.slug,
      photoUrl: p.photo_url
    }))
  }
}

type NewSongInput = {
  cassetteId: string
  title: string
  artist: string
  artistProfileId: string | null
  side: 'A' | 'B'
  position: number
}

/** Shared validation for the manual "add song" flow (prepare + finalize). */
async function validateNewSongSlot(
  svc: ReturnType<typeof createServiceClient>,
  input: NewSongInput
): Promise<string | null> {
  if (!input.cassetteId || !input.title || !input.artist || !input.side || !input.position) {
    return 'faltan_datos'
  }
  if (input.side !== 'A' && input.side !== 'B') return 'lado_invalido'
  if (!Number.isInteger(input.position) || input.position < 1 || input.position > 14) {
    return 'posicion_invalida'
  }

  const { data: cassette } = await svc.from('cassettes').select('id').eq('id', input.cassetteId).maybeSingle()
  if (!cassette) return 'cassette_no_encontrado'

  if (input.artistProfileId) {
    const { data: banda } = await svc.from('profiles').select('id, role').eq('id', input.artistProfileId).maybeSingle()
    if (!banda || banda.role !== 'banda') return 'banda_no_encontrada'
  }

  const { data: existing } = await svc
    .from('songs')
    .select('id')
    .eq('cassette_id', input.cassetteId)
    .eq('side', input.side)
    .eq('position', input.position)
    .maybeSingle()
  if (existing) return 'slot_ocupado'

  return null
}

/**
 * Manually add a song to a cassette: validates the slot and mints a signed
 * upload URL so the browser pushes the MP3 straight to the `songs` bucket,
 * keeping the file out of the Server Action body. Pair with {@link finalizeAddSong}.
 */
export async function prepareAddSong(
  input: NewSongInput & { fileName: string; fileType: string; fileSize: number }
): Promise<{ ok: true; key: string; token: string } | { ok: false; error: string }> {
  await requireAdmin()
  const svc = createServiceClient()

  const title = input.title.trim()
  const artist = input.artist.trim()
  const metaError = audioMetaError(input.fileName, input.fileType, input.fileSize)
  if (metaError) return { ok: false, error: metaError }

  const slotError = await validateNewSongSlot(svc, { ...input, title, artist })
  if (slotError) return { ok: false, error: slotError }

  const ext = (input.fileName.split('.').pop() ?? 'mp3').toLowerCase()
  const key = songStorageKey({ cassetteId: input.cassetteId, artist, title, ext })

  const { data, error } = await svc.storage.from(SONGS_BUCKET).createSignedUploadUrl(key, { upsert: true })
  if (error || !data) return { ok: false, error: error?.message ?? 'no_se_pudo_preparar' }

  return { ok: true, key, token: data.token }
}

/** Insert the song row for an MP3 the browser already uploaded to `key`. */
export async function finalizeAddSong(
  input: NewSongInput & { genre: string | null; durationSeconds: number | null; key: string }
): Promise<{ ok: true; songId: string } | { ok: false; error: string }> {
  await requireAdmin()
  const svc = createServiceClient()

  const title = input.title.trim()
  const artist = input.artist.trim()
  if (!input.key || !input.key.startsWith(`${input.cassetteId}/`)) return { ok: false, error: 'faltan_datos' }

  // Re-check the slot: it may have been taken between prepare and finalize.
  const slotError = await validateNewSongSlot(svc, { ...input, title, artist })
  if (slotError) {
    await svc.storage.from(SONGS_BUCKET).remove([input.key])
    return { ok: false, error: slotError }
  }

  const {
    data: { publicUrl }
  } = svc.storage.from(SONGS_BUCKET).getPublicUrl(input.key)

  const { data: inserted, error: insertError } = await svc
    .from('songs')
    .insert({
      cassette_id: input.cassetteId,
      title,
      artist,
      artist_profile_id: input.artistProfileId,
      genre: input.genre,
      side: input.side,
      position: input.position,
      audio_url: publicUrl,
      duration_seconds: input.durationSeconds
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    // Keep DB and storage in sync if the row failed to insert.
    await svc.storage.from(SONGS_BUCKET).remove([input.key])
    return { ok: false, error: insertError?.message ?? 'insert_failed' }
  }

  revalidatePath(`/admin/cassettes/${input.cassetteId}`)
  revalidatePath('/admin/cassettes')
  revalidatePath('/')
  return { ok: true, songId: inserted.id }
}

/**
 * One-shot migration: move every track of a cassette into the canonical
 * `{cassetteId}/{artist-slug}-{title-slug}.{ext}` layout in the `songs` bucket.
 *
 * Skips:
 *  - Tracks whose `audio_url` doesn't point to the `songs` bucket (e.g. external
 *    Spotify/YouTube link — those need a real upload, not a move).
 *  - Tracks already at the target key (idempotent).
 */
export async function migrateCassetteAudioToFolders(
  formData: FormData
): Promise<{ ok: true; moved: number; skipped: number; failed: number } | { ok: false; error: string }> {
  await requireAdmin()
  const svc = createServiceClient()

  const cassetteId = formData.get('cassette_id') as string
  if (!cassetteId) return { ok: false, error: 'faltan_datos' }

  const { data: tracks, error: tracksError } = await svc
    .from('songs')
    .select('id, artist, title, audio_url')
    .eq('cassette_id', cassetteId)
  if (tracksError) return { ok: false, error: tracksError.message }
  if (!tracks || tracks.length === 0) return { ok: true, moved: 0, skipped: 0, failed: 0 }

  let moved = 0
  let skipped = 0
  let failed = 0

  for (const track of tracks) {
    const oldKey = extractStorageKey(track.audio_url, SONGS_BUCKET)
    if (!oldKey) {
      skipped++
      continue
    }

    const ext = (oldKey.split('.').pop() ?? 'mp3').split('?')[0].toLowerCase()
    const newKey = songStorageKey({ cassetteId, artist: track.artist, title: track.title, ext })

    if (oldKey === newKey) {
      skipped++
      continue
    }

    const { error: moveError } = await svc.storage.from(SONGS_BUCKET).move(oldKey, newKey)
    if (moveError) {
      failed++
      continue
    }

    const {
      data: { publicUrl }
    } = svc.storage.from(SONGS_BUCKET).getPublicUrl(newKey)

    const { error: updateError } = await svc.from('songs').update({ audio_url: publicUrl }).eq('id', track.id)
    if (updateError) {
      // Roll the file back to its original location to keep DB and Storage in sync.
      await svc.storage.from(SONGS_BUCKET).move(newKey, oldKey)
      failed++
      continue
    }

    moved++
  }

  revalidatePath(`/admin/cassettes/${cassetteId}`)
  revalidatePath('/')
  return { ok: true, moved, skipped, failed }
}

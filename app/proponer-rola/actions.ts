'use server'

import { audioMetaError, extractStorageKey, proposalStorageKey, SONGS_BUCKET } from '@/lib/audio'
import { LOOPS_IDS, sendTransactional } from '@/lib/loops'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'

const WEEKLY_LIMIT = 3

/**
 * Mint a signed upload URL so the browser can push the proposal's MP3 straight
 * to the `songs` bucket (the file never travels through a Server Action body,
 * which caps at 5mb). Validates session, the weekly limit and the file metadata
 * before handing back a token. Pair with the `audio_url` field of submitProposal.
 */
export async function prepareProposalAudioUpload(input: {
  fileName: string
  fileType: string
  fileSize: number
  artist: string
  title: string
}): Promise<{ ok: true; key: string; token: string; publicUrl: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No has iniciado sesión.' }

  const metaError = audioMetaError(input.fileName, input.fileType, input.fileSize)
  if (metaError) return { ok: false, error: metaError }

  if (await weeklyLimitReached(supabase, user.id)) {
    return { ok: false, error: 'Ya alcanzaste tu límite de 3 propuestas esta semana.' }
  }

  const svc = createServiceClient()
  const ext = (input.fileName.split('.').pop() ?? 'mp3').toLowerCase()
  const key = proposalStorageKey({
    userId: user.id,
    artist: input.artist || 'banda',
    title: input.title || 'rola',
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

export async function submitProposal(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/iniciar-sesion')
  }

  if (await weeklyLimitReached(supabase, user.id)) {
    redirect('/proponer-rola?error=' + encodeURIComponent('Ya alcanzaste tu límite de 3 propuestas esta semana.'))
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isBanda = profile?.role === 'banda'

  // The MP3 must always be a file the browser already uploaded to our `songs`
  // bucket — ignore anything else so the field can't point at an arbitrary URL.
  // It's mandatory only for bandas (their own material); optional for others.
  let audioUrl = (formData.get('audio_url') as string) || ''
  if (audioUrl && !extractStorageKey(audioUrl, SONGS_BUCKET)) audioUrl = ''
  if (isBanda && !audioUrl) {
    redirect('/proponer-rola?error=' + encodeURIComponent('Sube el MP3 de tu rola para enviar la propuesta.'))
  }

  const { error } = await supabase.from('song_proposals').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    artist: formData.get('artist') as string,
    genre: (formData.get('genre') as string) || null,
    external_link: (formData.get('external_link') as string) || null,
    download_link: (formData.get('download_link') as string) || null,
    audio_file_path: (formData.get('audio_file_path') as string) || null,
    audio_url: audioUrl || null,
    comment: (formData.get('comment') as string) || null,
    rights_accepted: formData.get('rights_accepted') === 'true' ? true : null,
    status: 'pending'
  })

  if (error) {
    redirect('/proponer-rola?error=' + encodeURIComponent('Error al enviar tu propuesta. Intenta de nuevo.'))
  }

  if (user.email) {
    const result = await sendTransactional({
      transactionalId: LOOPS_IDS.PROPOSAL_SUBMITTED,
      email: user.email
    })
    if (!result.ok) {
      console.error('[song-proposal] email failed', { userId: user.id, error: result.error })
    }
  }

  redirect('/proponer-rola?success=true')
}

async function weeklyLimitReached(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const { count } = await supabase
    .from('song_proposals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', getStartOfWeek())
  return count !== null && count >= WEEKLY_LIMIT
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

'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { LOOPS_IDS, sendTransactional } from '@/lib/loops'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/** Guard: ensure current user is admin */
async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/')

  return user
}

/**
 * Accept a proposal: insert into songs table for the active cassette,
 * update proposal status to 'selected'.
 */
export async function acceptProposal(formData: FormData) {
  const user = await requireAdmin()
  const supabase = createServiceClient()

  const proposalId = formData.get('proposal_id') as string
  const side = formData.get('side') as 'A' | 'B'
  const position = Number(formData.get('position'))

  if (!proposalId || !side || !position) {
    redirect('/rolas-propuestas?error=' + encodeURIComponent('Faltan datos para aceptar la propuesta.'))
  }

  // Get the active cassette
  const { data: cassette } = await supabase.from('cassettes').select('id').eq('active', true).single()

  if (!cassette) {
    redirect('/rolas-propuestas?error=' + encodeURIComponent('No hay cassette activo.'))
  }

  // Get proposal data
  const { data: proposal } = await supabase.from('song_proposals').select('*').eq('id', proposalId).single()

  if (!proposal) {
    redirect('/rolas-propuestas?error=' + encodeURIComponent('Propuesta no encontrada.'))
  }

  // Guard: ensure (cassette, side, position) slot is free
  const { data: slotTaken } = await supabase
    .from('songs')
    .select('id, title, artist')
    .eq('cassette_id', cassette.id)
    .eq('side', side)
    .eq('position', position)
    .maybeSingle()

  if (slotTaken) {
    redirect(
      '/rolas-propuestas?error=' +
        encodeURIComponent(
          `El lado ${side} posición #${position} ya está ocupado por "${slotTaken.artist} — ${slotTaken.title}".`
        )
    )
  }

  // Insert into songs
  const { data: insertedSong, error: songError } = await supabase
    .from('songs')
    .insert({
      cassette_id: cassette.id,
      title: proposal.title,
      artist: proposal.artist,
      genre: proposal.genre,
      side,
      position,
      audio_url: proposal.external_link || proposal.audio_file_path,
      proposal_id: proposal.id
    })
    .select('id')
    .single()

  if (songError) {
    redirect('/rolas-propuestas?error=' + encodeURIComponent('Error al insertar canción: ' + songError.message))
  }

  // Update proposal status — surface error and roll back the song insert if it fails
  const { error: updateError } = await supabase
    .from('song_proposals')
    .update({
      status: 'selected',
      cassette_id: cassette.id,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq('id', proposalId)

  if (updateError) {
    // Manual rollback to avoid an orphaned song with a still-pending proposal
    if (insertedSong?.id) {
      await supabase.from('songs').delete().eq('id', insertedSong.id)
    }
    redirect(
      '/rolas-propuestas?error=' +
        encodeURIComponent('Error al actualizar propuesta (canción revertida): ' + updateError.message)
    )
  }

  const { data: proposalUser } = await supabase.auth.admin.getUserById(proposal.user_id)
  const recipientEmail = proposalUser?.user?.email

  if (recipientEmail) {
    await sendTransactional({
      transactionalId: LOOPS_IDS.PROPOSAL_SELECTED,
      email: recipientEmail
    })
  }

  revalidatePath('/rolas-propuestas')
}

/**
 * Reject a proposal: set status to 'rejected'.
 */
export async function rejectProposal(formData: FormData) {
  const user = await requireAdmin()
  const supabase = createServiceClient()

  const proposalId = formData.get('proposal_id') as string

  if (!proposalId) {
    redirect('/rolas-propuestas?error=' + encodeURIComponent('ID de propuesta faltante.'))
  }

  await supabase
    .from('song_proposals')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq('id', proposalId)

  revalidatePath('/rolas-propuestas')
}

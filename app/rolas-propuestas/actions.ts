'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
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

  // Insert into songs
  const { error: songError } = await supabase.from('songs').insert({
    cassette_id: cassette.id,
    title: proposal.title,
    artist: proposal.artist,
    genre: proposal.genre,
    side,
    position,
    audio_url: proposal.external_link || proposal.audio_file_path,
    proposal_id: proposal.id
  })

  if (songError) {
    redirect('/rolas-propuestas?error=' + encodeURIComponent('Error al insertar canción: ' + songError.message))
  }

  // Update proposal status
  await supabase
    .from('song_proposals')
    .update({
      status: 'selected',
      cassette_id: cassette.id,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq('id', proposalId)

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

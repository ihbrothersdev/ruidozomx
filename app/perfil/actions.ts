'use server'

import { createClient } from '@/lib/supabase/server'
import type { UserProposalType } from '@/lib/types'

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

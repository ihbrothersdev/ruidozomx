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

  return { success: true }
}

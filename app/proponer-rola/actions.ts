'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitProposal(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/iniciar-sesion')
  }

  // Check weekly limit (3 per calendar week)
  const { count } = await supabase
    .from('song_proposals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', getStartOfWeek())

  if (count !== null && count >= 3) {
    redirect('/proponer-rola?error=' + encodeURIComponent('Ya alcanzaste tu límite de 3 propuestas esta semana.'))
  }

  const { error } = await supabase.from('song_proposals').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    artist: formData.get('artist') as string,
    genre: (formData.get('genre') as string) || null,
    external_link: (formData.get('external_link') as string) || null,
    audio_file_path: (formData.get('audio_file_path') as string) || null,
    comment: (formData.get('comment') as string) || null,
    status: 'pending'
  })

  if (error) {
    redirect('/proponer-rola?error=' + encodeURIComponent('Error al enviar tu propuesta. Intenta de nuevo.'))
  }

  redirect('/proponer-rola?success=true')
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

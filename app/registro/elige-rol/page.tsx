import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import EligeRolView from './_components/EligeRolView'

export const metadata: Metadata = {
  title: 'Elige tu rol',
  description: 'Banda, fan, manager, venue, promotor o proveedor — elige cómo te quieres registrar en Ruidozo MX.'
}

export default async function EligeRolPage() {
  // If the user is already logged in, the registration flow doesn't apply —
  // bounce them to their profile.
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/perfil')
  }

  return <EligeRolView />
}

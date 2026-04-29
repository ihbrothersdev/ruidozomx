import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EligeRolView from './_components/EligeRolView'

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

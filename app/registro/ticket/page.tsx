import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TicketView from './_components/TicketView'

export default async function TicketPage() {
  // The ticket is the post-signup confirmation page. If the user is already
  // logged in, they shouldn't be back here — send them to their profile.
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/perfil')
  }

  return <TicketView />
}

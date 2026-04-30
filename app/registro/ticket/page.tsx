import { createClient } from '@/lib/supabase/server'
import TicketView from './_components/TicketView'

export default async function TicketPage() {
  // The ticket is the onboarding-confirmation page. We intentionally do NOT
  // gate it on auth: after the email-confirmation link the user IS logged in
  // and we still want to land them here (instead of /perfil) so they don't
  // miss the onboarding ticket.
  //
  // We do peek at the session so the client can decide which toast to show
  // — "confirma tu correo" only makes sense for the pre-confirmation visit.
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return <TicketView isLoggedIn={!!user} />
}

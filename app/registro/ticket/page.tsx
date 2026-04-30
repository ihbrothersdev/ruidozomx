import TicketView from './_components/TicketView'

export default function TicketPage() {
  // The ticket is the onboarding-confirmation page. We intentionally do NOT
  // gate it on auth: after the email-confirmation link the user IS logged in
  // and we still want to land them here (instead of /perfil) so they don't
  // miss the onboarding ticket. The page is harmless to revisit for anyone.
  return <TicketView />
}

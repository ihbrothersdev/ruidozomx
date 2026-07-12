import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Donations is deliberately narrower than the rest of /admin: the parent layout
// lets any role='admin' in, but this section is scoped to its two owners by
// user_id (stable across email changes, unlike the git author addresses).
export const DONATION_VIEWER_IDS = new Set<string>([
  '0d742bd0-4b2e-4ec6-90d8-848f29321209', // Hugo Archundia — archundiah11@gmail.com
  'f967f1e0-221c-4c07-a9af-412b3d2b32db' // Ivan Morales — ivann.mgz@gmail.com
])

export function canViewDonations(userId: string | null | undefined): boolean {
  return !!userId && DONATION_VIEWER_IDS.has(userId)
}

/** Page-level guard. The parent admin layout already enforces auth + admin role;
 *  this additionally restricts to the donation owners and bounces others back. */
export async function requireDonationViewer(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/iniciar-sesion?e=no_autorizado')
  if (!canViewDonations(user.id)) redirect('/admin')

  return user.id
}

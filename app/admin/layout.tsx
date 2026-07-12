import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AdminShell } from './_components/AdminShell'
import { AdminToast } from './_components/AdminToast'
import { canViewDonations } from './donaciones/_lib/access'

export const metadata = {
  title: 'Admin · Ruidozo MX'
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion?e=no_autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name, photo_url')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <AdminShell
      displayName={profile.display_name ?? 'Admin'}
      photoUrl={profile.photo_url ?? null}
      canViewDonations={canViewDonations(user.id)}
    >
      <Suspense>
        <AdminToast />
      </Suspense>
      {children}
    </AdminShell>
  )
}

import { checkProposalSlots } from '@/lib/supabase/proposals'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/types'
import { Suspense } from 'react'
import { ProponerRolaContent } from './_components/ProponerRolaContent'

export default async function ProponerRolaPage() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  let role: Role | null = null
  let slotsMessage: string | null = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = (profile?.role as Role | undefined) ?? null
    slotsMessage = (await checkProposalSlots(supabase, user.id)).message
  }

  return (
    <Suspense>
      <ProponerRolaContent
        role={role}
        slotsMessage={slotsMessage}
      />
    </Suspense>
  )
}

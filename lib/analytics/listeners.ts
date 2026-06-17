import 'server-only'
import { createServiceClient } from '@/lib/supabase/service'

/** A visitor is one identity: the auth user when logged in, else the anon session. */
function countIdentities(rows: { user_id: string | null; session_id: string | null }[]): number {
  const ids = new Set<string>()
  for (const r of rows) {
    const id = r.user_id ?? r.session_id
    if (id) ids.add(id)
  }
  return ids.size
}

/**
 * Distinct people who have ever started a listening session, derived from
 * `song_events`. Uses the service client (RLS-bypassing, server-only).
 * Returns 0 on error so the UI can degrade gracefully instead of throwing.
 */
export async function getTotalListeners(): Promise<number> {
  try {
    const svc = createServiceClient()
    const { data } = await svc.from('song_events').select('user_id, session_id').eq('type', 'cassette_session_start')
    return countIdentities(data ?? [])
  } catch {
    return 0
  }
}

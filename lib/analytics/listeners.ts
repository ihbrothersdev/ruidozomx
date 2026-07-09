import 'server-only'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Distinct people who have ever started a listening session, derived from
 * `song_events`. Counted in Postgres via the total_listeners() RPC so the result
 * is exact and stable — a client-side `.select()` is capped at 1000 rows and
 * drifts. Uses the service client (RLS-bypassing, server-only). Returns 0 on
 * error so the UI can degrade gracefully instead of throwing.
 */
export async function getTotalListeners(): Promise<number> {
  try {
    const svc = createServiceClient()
    const { data, error } = await svc.rpc('total_listeners')
    return error ? 0 : (data ?? 0)
  } catch {
    return 0
  }
}

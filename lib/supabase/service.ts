import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from './env'

/**
 * Server-only client using service_role key — bypasses RLS.
 * Use for: registration profile inserts, admin operations
 * (cassette management, proposal reviews, system_config updates).
 *
 * NEVER import this in client components or expose the key to the browser.
 */
export function createServiceClient() {
  const { url } = getSupabaseEnv()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error(
      'Missing environment variable: SUPABASE_SERVICE_ROLE_KEY. ' +
        'Add it to .env.local (never expose it to the client).'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

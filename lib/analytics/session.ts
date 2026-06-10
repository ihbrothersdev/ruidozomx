/**
 * Persistent anonymous session id stored in localStorage. Used to group
 * analytics events from the same browser when the user isn't logged in.
 *
 * - Generated lazily the first time it's read in the browser.
 * - Stable across sessions (no expiration); we trade exact "unique users"
 *   for a robust signal of distinct browsers.
 */

const KEY = 'ruidozo:anon_session_id'

export function getAnonSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.localStorage.getItem(KEY)
    if (!id) {
      id = generateId()
      window.localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

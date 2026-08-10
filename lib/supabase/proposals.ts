import type { SupabaseClient } from '@supabase/supabase-js'

/** How many rolas a band can have in flight at once. */
export const PROPOSAL_SLOTS = 3

/**
 * Statuses that occupy a slot. `accepted` is deliberately absent: once a rola
 * makes it onto a cassette it stays there and gives the band its slot back.
 * `rejected` frees the slot too.
 */
export const LIVE_PROPOSAL_STATUSES = ['pending', 'in_review'] as const

/**
 * Why the band can't propose right now. Bands carried over from the old weekly
 * limit can sit well above the cap (one is at 17), so a flat "ya tienes 3" would
 * be a lie — tell them exactly how many have to go. `inEditor` drops the pointer
 * to "editar perfil" for the one caller that already lives there.
 */
export function slotsFullMessage(used: number, inEditor = false): string {
  const where = inEditor ? '' : ' desde "editar perfil"'
  if (used <= PROPOSAL_SLOTS) {
    return `Ya usaste tus ${PROPOSAL_SLOTS} espacios. Quita una rola${where} para poder subir otra.`
  }
  const toRemove = used - PROPOSAL_SLOTS + 1
  return `Tienes ${used} rolas y el máximo son ${PROPOSAL_SLOTS}. Quita ${toRemove}${where} para poder subir otra.`
}

/** Rolas currently taking up one of the band's slots. */
export async function countLiveProposals(client: SupabaseClient, userId: string): Promise<number> {
  const { count } = await client
    .from('song_proposals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null)
    .in('status', LIVE_PROPOSAL_STATUSES)
  return count ?? 0
}

export interface SlotStatus {
  used: number
  full: boolean
  /** Ready-to-show explanation, or null when the band still has room. */
  message: string | null
}

export async function checkProposalSlots(client: SupabaseClient, userId: string): Promise<SlotStatus> {
  const used = await countLiveProposals(client, userId)
  const full = used >= PROPOSAL_SLOTS
  return { used, full, message: full ? slotsFullMessage(used) : null }
}

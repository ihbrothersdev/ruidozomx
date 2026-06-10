import type { UserProposalSummary } from '../DynamicModules'

/** Red-folder section label, shared across the inbox sections. */
export const SECTION_LABEL = 'font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'

/** Red-bordered list wrapper used by every inbox section. */
export const SECTION_LIST = 'space-y-3 border-2 border-red-700 px-3 py-3'

export const PROPOSAL_STATUS_LABEL: Record<UserProposalSummary['status'], { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-yellow-400/30 text-yellow-800' },
  accepted: { label: 'Aceptada', cls: 'bg-green-600 text-white' },
  rejected: { label: 'Rechazada', cls: 'bg-red-600 text-white' },
  withdrawn: { label: 'Retirada', cls: 'bg-black/20 text-black/60' }
}

export function formatInboxDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

import type { Role } from '@/lib/types'
import { ROLE_DYNAMIC_MODULES } from './profile-constants'

export interface SongProposalSummary {
  id: string
  title: string
  artist: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

interface DynamicModulesProps {
  role: Role
  roleProfile?: Record<string, any> | null
  /** Latest proposals to display (cap to 3 from the page). */
  songProposals?: SongProposalSummary[]
  /** Total proposals submitted by this user (across all time). */
  songProposalsCount?: number
}

/** Resolve data for a module: returns an array of items to display as a list */
function getModuleItems(mod: { dataField?: string }, roleProfile?: Record<string, any> | null): string[] {
  if (!mod.dataField || !roleProfile) return []
  const value = roleProfile[mod.dataField]
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    // Split comma-separated text into list items
    return value
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
  }
  return []
}

const STATUS_LABEL: Record<SongProposalSummary['status'], { label: string; cls: string }> = {
  pending: { label: 'En curaduría', cls: 'bg-black/10 text-black/70' },
  accepted: { label: 'Aceptada', cls: 'bg-green-600/15 text-green-700' },
  rejected: { label: 'No incluida', cls: 'bg-red-600/15 text-red-700' }
}

export default function DynamicModules({
  role,
  roleProfile,
  songProposals = [],
  songProposalsCount
}: DynamicModulesProps) {
  const modules = ROLE_DYNAMIC_MODULES[role]
  if (!modules || modules.length === 0) return null

  // Always show the latest 3 in the list, regardless of how many came in.
  const proposalsToShow = songProposals.slice(0, 3)
  const proposalsTotal = songProposalsCount ?? songProposals.length

  // Build the visible modules list — drop anything without data.
  const visible = modules
    .map(mod => {
      if (mod.key === 'proposals') {
        return { mod, kind: 'proposals' as const, proposals: proposalsToShow, total: proposalsTotal }
      }
      const items = getModuleItems(mod, roleProfile)
      return { mod, kind: 'list' as const, items }
    })
    .filter(entry => (entry.kind === 'proposals' ? entry.total > 0 : entry.items.length > 0))

  if (visible.length === 0) return null

  return (
    <div className='space-y-4'>
      {visible.map(entry => (
        <div
          key={entry.mod.key}
          className='border border-dashed border-black/20 p-4'
        >
          <div className='flex items-baseline justify-between gap-3'>
            <h4 className='font-pt-mono text-lg font-bold tracking-wider text-black uppercase'>{entry.mod.title}</h4>
            {entry.kind === 'proposals' && (
              <span className='font-pt-mono shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold tracking-wider text-white'>
                {entry.total}
              </span>
            )}
          </div>

          {entry.kind === 'list' && (
            <ul className='mt-2 space-y-1'>
              {entry.items.map((item, i) => (
                <li
                  key={i}
                  className='font-pt-mono flex items-center gap-2 text-sm text-black/80'
                >
                  <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {entry.kind === 'proposals' && (
            <ul className='mt-2 space-y-1.5'>
              {entry.proposals.map(p => {
                const status = STATUS_LABEL[p.status]
                return (
                  <li
                    key={p.id}
                    className='flex items-start gap-2 text-sm'
                  >
                    <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' />
                    <div className='font-pt-mono flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                      <span className='font-bold text-black'>{p.title}</span>
                      <span className='text-xs text-black/60'>— {p.artist}</span>
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

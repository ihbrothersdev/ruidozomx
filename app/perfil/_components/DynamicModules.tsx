import type { Role } from '@/lib/types'
import { ROLE_DYNAMIC_MODULES } from './profile-constants'

interface DynamicModulesProps {
  role: Role
  roleProfile?: Record<string, any> | null
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

export default function DynamicModules({ role, roleProfile }: DynamicModulesProps) {
  const modules = ROLE_DYNAMIC_MODULES[role]
  if (!modules || modules.length === 0) return null

  return (
    <div className='space-y-4'>
      {modules.map(mod => {
        const items = getModuleItems(mod, roleProfile)
        return (
          <div
            key={mod.key}
            className='border border-dashed border-black/20 p-4'
          >
            <h4 className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>{mod.title}</h4>
            {items.length > 0 ? (
              <ul className='mt-2 space-y-1'>
                {items.map((item, i) => (
                  <li
                    key={i}
                    className='font-pt-mono flex items-center gap-2 text-sm text-black/80'
                  >
                    <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='font-pt-mono mt-2 text-xs text-black/40 italic'>Próximamente</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

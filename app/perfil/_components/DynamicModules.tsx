import type { Role } from '@/lib/types'
import { ROLE_DYNAMIC_MODULES } from './profile-constants'

interface DynamicModulesProps {
  role: Role
}

export default function DynamicModules({ role }: DynamicModulesProps) {
  const modules = ROLE_DYNAMIC_MODULES[role]
  if (!modules || modules.length === 0) return null

  return (
    <div className='space-y-4'>
      {modules.map(mod => (
        <div
          key={mod.key}
          className='border border-dashed border-black/20 p-4'
        >
          <h4 className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>{mod.title}</h4>
          <p className='font-pt-mono mt-2 text-xs text-black/40 italic'>Próximamente</p>
        </div>
      ))}
    </div>
  )
}

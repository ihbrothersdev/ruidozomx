import type { Role } from '@/lib/types'

export interface CommunityProfile {
  id: string
  display_name: string
  slug: string
  photo_url: string | null
  role: Role
  city: string | null
  state: string | null
  country: string
  bio: string | null
  activity_highlight: string
}

export type RoleFilter = 'todos' | 'banda' | 'fan' | 'venue' | 'promotor' | 'manager' | 'agente' | 'proveedor'

export const ROLE_FILTER_LABELS: Record<RoleFilter, string> = {
  todos: 'Todos',
  banda: 'Bandas',
  venue: 'Foros/Venues',
  promotor: 'Promotores',
  manager: 'Managers',
  agente: 'Agentes',
  proveedor: 'Proveedores',
  fan: 'Fans'
}

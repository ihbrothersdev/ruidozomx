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
  genre: string | null
  activity_highlight: string
  /** Only ever set for admin viewers. */
  unconfirmedWithoutSongs?: boolean
}

/** sessionStorage key holding the last grid URL (filters + page), for returning to it. */
export const COMMUNITY_LISTING_KEY = 'comunidad:listing'

export type RoleFilter = 'banda' | 'fan' | 'venue' | 'promotor' | 'manager' | 'agente' | 'proveedor'

export const ROLE_FILTER_LABELS: Record<RoleFilter, string> = {
  banda: 'Bandas',
  venue: 'Foros/Venues',
  promotor: 'Promotores',
  manager: 'Managers',
  agente: 'Agentes',
  proveedor: 'Proveedores',
  fan: 'Fans'
}

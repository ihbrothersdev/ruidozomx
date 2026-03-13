import type { Role } from '@/lib/types'

export interface RoleCard {
  role: Role | 'manager_group'
  src: string
  alt: string
  tilt: string
}

export const TOP_ROW_CARDS: RoleCard[] = [
  {
    role: 'banda',
    src: '/assets/registro/elige-rol/banda-solista.png',
    alt: 'Banda / Solista',
    tilt: '-rotate-2 -translate-y-2'
  },
  {
    role: 'fan',
    src: '/assets/registro/elige-rol/fan.png',
    alt: 'Fan o Público',
    tilt: 'rotate-1 translate-y-4'
  },
  {
    role: 'manager_group',
    src: '/assets/registro/elige-rol/manager-promotor-agente.png',
    alt: 'Manager / Promotor / Agente',
    tilt: '-rotate-1 -translate-y-3'
  },
  {
    role: 'venue',
    src: '/assets/registro/elige-rol/venue.png',
    alt: 'Foro / Venue',
    tilt: 'rotate-2 translate-y-1'
  }
]

export const PROVEEDOR_CARD: RoleCard = {
  role: 'proveedor',
  src: '/assets/registro/elige-rol/proveedor.png',
  alt: 'Proveedor',
  tilt: '-rotate-4'
}

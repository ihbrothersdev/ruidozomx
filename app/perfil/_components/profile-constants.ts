import type { Role } from '@/lib/types'

export const ROLE_TABLE: Record<Role, string> = {
  banda: 'band_profiles',
  fan: 'fan_profiles',
  manager: 'industry_profiles',
  agente: 'industry_profiles',
  promotor: 'industry_profiles',
  proveedor: 'provider_profiles',
  venue: 'venue_profiles'
}

/** Chip config per role: which fields to display as red chips and their short labels.
 *  - boolean fields: shown only when value is true
 *  - array fields: each array item becomes its own chip
 *  - text fields: shown as a single chip with the value
 */
export const ROLE_CHIP_CONFIG: Record<Role, { key: string; label: string; type: 'boolean' | 'array' | 'text' }[]> = {
  banda: [
    { key: 'available_live', label: 'Tocar en vivo', type: 'boolean' },
    { key: 'available_tours', label: 'Giras', type: 'boolean' },
    { key: 'open_collabs', label: 'Colaboraciones', type: 'boolean' },
    { key: 'willing_travel', label: 'Salir de su estado/país', type: 'boolean' }
  ],
  fan: [{ key: 'favorite_genres', label: 'Géneros favoritos', type: 'array' }],
  manager: [
    { key: 'represents_artists', label: 'Representa artistas', type: 'boolean' },
    { key: 'seeks_emerging_talent', label: 'Busca talento emergente', type: 'boolean' },
    { key: 'accept_proposals', label: 'Recibe propuestas', type: 'boolean' }
  ],
  agente: [
    { key: 'represents_artists_live', label: 'Representa artistas para tocadas', type: 'boolean' },
    { key: 'territorial_reach', label: 'Alcance territorial', type: 'array' },
    { key: 'seeks_new_projects', label: 'Busca nuevos proyectos', type: 'boolean' },
    { key: 'accept_proposals', label: 'Recibe propuestas', type: 'boolean' }
  ],
  promotor: [
    { key: 'territorial_reach', label: 'Alcance territorial', type: 'array' },
    { key: 'event_types', label: 'Tipo de eventos', type: 'array' }
  ],
  proveedor: [
    { key: 'service_types', label: 'Tipo de servicio', type: 'array' },
    { key: 'territorial_reach', label: 'Alcance territorial', type: 'array' },
    { key: 'works_emerging_projects', label: 'Trabaja con proyectos emergentes', type: 'boolean' }
  ],
  venue: [
    { key: 'capacity', label: 'Capacidad', type: 'text' },
    { key: 'venue_type', label: 'Tipo', type: 'array' },
    { key: 'has_audio', label: 'Audio propio', type: 'boolean' },
    { key: 'has_lighting', label: 'Iluminación', type: 'boolean' }
  ]
}

/** Dynamic module sections for the right column, per role.
 *  - `dataField`: if set, the module reads this field from roleProfile and displays it.
 *  - If the field is absent or empty, falls back to "Próximamente".
 */
export const ROLE_DYNAMIC_MODULES: Record<Role, { title: string; key: string; dataField?: string }[]> = {
  banda: [
    { title: 'Próximas fechas', key: 'dates' },
    { title: 'Convocatorias', key: 'calls' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  fan: [{ title: 'Rolas propuestas al cassete', key: 'proposals' }],
  manager: [
    { title: 'Artistas representados', key: 'artists', dataField: 'artists_represented' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  agente: [
    { title: 'Artistas que representa', key: 'artists' },
    { title: 'Próximos eventos', key: 'events' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  promotor: [
    { title: 'Convocatoria / Fechas publicadas', key: 'calls' },
    { title: 'Próximos eventos', key: 'events' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  proveedor: [
    { title: 'Lista de servicios publicados', key: 'services' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  venue: [
    { title: 'Convocatorias publicadas', key: 'calls' },
    { title: 'Próximos eventos', key: 'events' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ]
}

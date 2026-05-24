import {
  CAPACITY_OPTIONS,
  EVENT_TYPE_OPTIONS,
  FAN_GENRE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  TERRITORIAL_REACH_OPTIONS,
  VENUE_TYPE_OPTIONS,
  type Role
} from '@/lib/types'

export const ROLE_TABLE: Record<Role, string | null> = {
  banda: 'band_profiles',
  fan: 'fan_profiles',
  manager: 'industry_profiles',
  agente: 'industry_profiles',
  promotor: 'industry_profiles',
  proveedor: 'provider_profiles',
  venue: 'venue_profiles',
  admin: null
}

/** Dynamic module sections for the right column, per role.
 *  - `dataField`: if set, the module reads this field from roleProfile and displays it.
 *  - If the field is absent or empty, falls back to "Próximamente".
 */
const CONNECTION_MODULES = [
  { title: 'Conexiones recibidas', key: 'connections_received' },
  { title: 'Conexiones enviadas', key: 'connections_sent' }
] as const

export const ROLE_DYNAMIC_MODULES: Record<Role, { title: string; key: string; dataField?: string }[]> = {
  banda: [
    ...CONNECTION_MODULES,
    { title: 'Fechas y convocatorias', key: 'events' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  fan: [...CONNECTION_MODULES, { title: 'Rolas propuestas al cassete', key: 'proposals' }],
  manager: [
    ...CONNECTION_MODULES,
    { title: 'Artistas representados', key: 'artists', dataField: 'artists_represented' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  agente: [
    ...CONNECTION_MODULES,
    { title: 'Artistas que representa', key: 'artists' },
    { title: 'Próximos eventos', key: 'events' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  promotor: [
    ...CONNECTION_MODULES,
    { title: 'Convocatoria / Fechas publicadas', key: 'calls' },
    { title: 'Próximos eventos', key: 'events' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  proveedor: [
    ...CONNECTION_MODULES,
    { title: 'Lista de servicios publicados', key: 'services' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  venue: [
    ...CONNECTION_MODULES,
    { title: 'Convocatorias publicadas', key: 'calls' },
    { title: 'Próximos eventos', key: 'events' },
    { title: 'Rolas propuestas al cassete', key: 'proposals' }
  ],
  admin: [...CONNECTION_MODULES, { title: 'Rolas propuestas al cassete', key: 'proposals' }]
}

/** Primary name field per role (for display in identity block) */
export const ROLE_NAME_FIELD: Record<Role, string> = {
  banda: 'band_name',
  fan: 'alias',
  manager: 'full_name',
  agente: 'full_name',
  promotor: 'full_name',
  proveedor: 'brand_name',
  venue: 'venue_name',
  admin: 'display_name'
}

/** Link field names per role */
export const ROLE_LINK_FIELD: Record<Role, string> = {
  banda: 'project_link',
  fan: '',
  manager: 'web_link',
  agente: 'web_link',
  promotor: 'web_link',
  proveedor: 'web_link',
  venue: 'web_link',
  admin: ''
}

export type EditableField =
  | { key: string; label: string; type: 'boolean' }
  | { key: string; label: string; type: 'array'; options: readonly string[] }
  | { key: string; label: string; type: 'choice'; options: readonly string[] }

export const ROLE_EDITABLE_FIELDS: Record<Role, EditableField[]> = {
  banda: [
    { key: 'available_live', label: 'Tocar en vivo', type: 'boolean' },
    { key: 'available_tours', label: 'Giras', type: 'boolean' },
    { key: 'open_collabs', label: 'Colaboraciones', type: 'boolean' },
    { key: 'willing_travel', label: 'Salir de su estado/país', type: 'boolean' },
    { key: 'publish_dates', label: 'Publica fechas en Ru!dozo', type: 'boolean' },
    { key: 'accept_proposals', label: 'Recibe propuestas', type: 'boolean' }
  ],
  fan: [
    { key: 'favorite_genres', label: 'Géneros favoritos', type: 'array', options: FAN_GENRE_OPTIONS },
    { key: 'notify_new_bands', label: 'Avisarme de nuevas bandas', type: 'boolean' },
    { key: 'propose_fav_bands', label: 'Proponer bandas favoritas', type: 'boolean' }
  ],
  manager: [
    { key: 'represents_artists', label: 'Representa artistas', type: 'boolean' },
    { key: 'seeks_emerging_talent', label: 'Busca talento emergente', type: 'boolean' },
    { key: 'promote_bands_ruidozo', label: 'Promueve bandas en Ru!dozo', type: 'boolean' },
    { key: 'accept_proposals', label: 'Recibe propuestas', type: 'boolean' }
  ],
  promotor: [
    { key: 'organizes_events', label: 'Organiza eventos', type: 'boolean' },
    { key: 'provide_events_ruidozo', label: 'Publica eventos en Ru!dozo', type: 'boolean' },
    { key: 'seeks_talent', label: 'Busca talento', type: 'boolean' },
    { key: 'event_types', label: 'Tipos de eventos', type: 'array', options: EVENT_TYPE_OPTIONS },
    { key: 'territorial_reach', label: 'Alcance territorial', type: 'array', options: TERRITORIAL_REACH_OPTIONS },
    { key: 'accept_proposals', label: 'Recibe propuestas', type: 'boolean' }
  ],
  agente: [
    { key: 'represents_artists_live', label: 'Representa artistas para tocadas', type: 'boolean' },
    { key: 'seeks_new_projects', label: 'Busca nuevos proyectos', type: 'boolean' },
    { key: 'territorial_reach', label: 'Alcance territorial', type: 'array', options: TERRITORIAL_REACH_OPTIONS },
    { key: 'accept_proposals', label: 'Recibe propuestas', type: 'boolean' }
  ],
  proveedor: [
    { key: 'service_types', label: 'Tipo de servicio', type: 'array', options: SERVICE_TYPE_OPTIONS },
    { key: 'territorial_reach', label: 'Alcance territorial', type: 'array', options: TERRITORIAL_REACH_OPTIONS },
    { key: 'works_emerging_projects', label: 'Trabaja con proyectos emergentes', type: 'boolean' },
    { key: 'publish_services', label: 'Publica servicios en Ru!dozo', type: 'boolean' },
    { key: 'accept_proposals', label: 'Recibe propuestas', type: 'boolean' }
  ],
  venue: [
    { key: 'capacity', label: 'Capacidad', type: 'choice', options: CAPACITY_OPTIONS },
    { key: 'venue_type', label: 'Tipo', type: 'array', options: VENUE_TYPE_OPTIONS },
    { key: 'has_audio', label: 'Audio propio', type: 'boolean' },
    { key: 'has_lighting', label: 'Iluminación', type: 'boolean' },
    { key: 'accepts_indie_proposals', label: 'Acepta propuestas indie', type: 'boolean' },
    { key: 'publish_calls_ruidozo', label: 'Publica convocatorias en Ru!dozo', type: 'boolean' }
  ],
  admin: []
}

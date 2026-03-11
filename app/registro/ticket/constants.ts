import type { Role } from '@/lib/types'

export const ROLE_ACTIONS: Record<Role, string[]> = {
  banda: [
    'Completa tu perfil con links a tu música',
    'Propón hasta 3 rolas por semana',
    'Conecta con otros artistas y venues',
    'Comparte tu perfil de Ruidozo'
  ],
  fan: [
    'Explora la compilación completa',
    'Propón hasta 3 rolas por semana',
    'Descubre bandas nuevas',
    'Sé parte de la comunidad'
  ],
  manager: [
    'Agrega a tus artistas',
    'Propón rolas para la compilación',
    'Conecta con venues y promotores',
    'Gestiona el perfil de tus artistas'
  ],
  agente: [
    'Conecta talento con oportunidades',
    'Propón rolas para la compilación',
    'Accede a perfiles de bandas y venues',
    'Amplía tu red de contactos'
  ],
  promotor: [
    'Descubre bandas para tus eventos',
    'Propón rolas para la compilación',
    'Conecta con artistas y managers',
    'Publica tus próximos eventos'
  ],
  proveedor: [
    'Muestra tus servicios a la escena',
    'Conecta con bandas y venues',
    'Recibe solicitudes de cotización',
    'Amplía tu portafolio'
  ],
  venue: [
    'Publica tu espacio y capacidad',
    'Descubre bandas para tu programación',
    'Conecta con managers y promotores',
    'Recibe propuestas de eventos'
  ]
}

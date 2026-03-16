import type { Role } from '@/lib/types'

const A = '/assets/registro/explicacion-rol'

export interface RoleExplanation {
  title: string
  subtitle: string
  /** Encabezado de sección (ej: "AQUÍ PUEDES:") */
  sectionHeader?: string
  bullets: string[]
  illustration: string
  formRole: Role
}

export const ROLE_EXPLANATIONS: Record<string, RoleExplanation> = {
  fan: {
    title: 'FAN/\nPÚBLICO',
    subtitle: 'Si escuchas algo que te gusta, respáldalo, compártelo y subele bien alto.',
    sectionHeader: 'AQUÍ PUEDES:',
    bullets: [
      'Descubrir música nueva cada semana',
      'Proponer rolas para el cassette semanal',
      'Apoyar proyectos que te gustan',
      'Conectar directamente con artistas',
      'Participar en la construcción de un espacio donde caben todos'
    ],
    illustration: `${A}/fan.png`,
    formRole: 'fan'
  },
  banda: {
    title: 'BANDA/\nSOLISTA',
    subtitle: 'Ru!dozo no va a sonar solo,\nentra y hazlo sonar',
    sectionHeader: 'AQUÍ PUEDES:',
    bullets: [
      'Postular tus rolas al cassette semanal',
      'Conectar con foros, promotores, público y proveedores.',
      'Generar vínculos.',
      'Activar tu proyecto más allá de las redes y sobre todo de las plataformas',
      'Colgar links con lo mejor de tu proyecto'
    ],
    illustration: `${A}/banda.png`,
    formRole: 'banda'
  },
  manager_group: {
    title: 'MANGER/\nPROMOTOR/\nAGENTE',
    subtitle: 'El talento ya existe,\nlo que falta es quien lo empuje',
    sectionHeader: 'AQUÍ PUEDES:',
    bullets: [
      'Proponer rolas de tus artistas para el cassette semanal',
      'Detectar proyectos emergentes antes de que exploten',
      'Conectar con bandas activas dentro del movimiento',
      'Proponer fechas, colaboraciones o circuitos',
      'Construir red con foros, proveedores y escena independiente'
    ],
    illustration: `${A}/manager.png`,
    formRole: 'manager'
  },
  venue: {
    title: 'FOROS/\nVENUES',
    subtitle: 'Un escenario vacío no sirve de nada\nun escenario sirve para ser ocupado',
    sectionHeader: 'AQUÍ PUEDES:',
    bullets: [
      'Conectar con bandas',
      'Publicar convocatorias o fechas disponibles',
      'Generar alianzas con promotores y managers',
      'Formar parte del circuito independiente'
    ],
    illustration: `${A}/venue.png`,
    formRole: 'venue'
  },
  proveedor: {
    title: 'PROVEEDOR',
    subtitle: 'La música se ve, se amplifica, se ilumina',
    sectionHeader: 'AQUÍ PUEDES:',
    bullets: [
      'Ofrecer servicios a proyectos activos',
      'Conectar con el ecosistema de RU!DOZO',
      'Ser parte del engranaje que mueve la escena',
      'Construir reputación dentro de RU!DOZO'
    ],
    illustration: `${A}/proveedor.png`,
    formRole: 'proveedor'
  }
}

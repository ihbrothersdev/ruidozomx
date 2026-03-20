import type { Role } from '@/lib/types'

export interface TicketContent {
  topLine: string
  headlinePre: string
  headline: string
  detail: string
  detailSub: string
  headlineStrikethrough?: boolean
}

export type TicketTableRowStyle =
  | 'top'
  | 'headlinePre'
  | 'headline'
  | 'detail'
  | 'detailSub'
  | 'static'
  | 'cta'
  | 'footer'

export interface TicketTableRow {
  text: string
  style: TicketTableRowStyle
  strikethrough?: boolean
}

export const TICKET_TABLE_ROTATION_DEG = -6

export type TicketLineColor = 'red' | 'black'

export interface TicketSectionLine {
  text: string
  color: TicketLineColor
}

export interface TicketSection {
  name: string
  lines: TicketSectionLine[]
}

/** Secciones del ticket por rol (texto según diseño). */
export const ROLE_TICKET_SECTIONS: Record<Role, TicketSection[]> = {
  fan: [
    {
      name: 'headline',
      lines: [
        { text: 'PROPÓN UNA', color: 'red' },
        { text: 'ROLA', color: 'red' }
      ]
    },
    {
      name: 'main',
      lines: [
        {
          text: 'DE TU BANDA O ARTISTA FAVORITO PARA NUESTRO CASETE SEMANAL',
          color: 'red'
        }
      ]
    },
  ],
  banda: [
    {
      name: 'headline',
      lines: [
        { text: 'PROPÓN UNA DE TUS', color: 'red' },
        { text: 'ROLAS', color: 'red' }
      ]
    },
    {
      name: 'main',
      lines: [{ text: 'PARA NUESTRO CASETE SEMANAL', color: 'black' }]
    },
  ],
  manager: [
    {
      name: 'headline',
      lines: [
        { text: 'PROPÓN UNA', color: 'red' },
        { text: 'ROLA', color: 'red' }
      ]
    },
    {
      name: 'main',
      lines: [
        {
          text: 'DEL TALENTO QUE MUEVES PARA NUESTRO CASETE SEMANAL',
          color: 'black'
        }
      ]
    },
  ],
  promotor: [
    {
      name: 'top',
      lines: [{ text: 'PUBLICA UNA FECHA O UNA CONVOCATORIA', color: 'black' }]
    },
    {
      name: 'headline',
      lines: [
        { text: 'PROPÓN UNA', color: 'red' },
        { text: 'ROLA', color: 'red' }
      ]
    },
    {
      name: 'main',
      lines: [
        {
          text: 'DE TU TALENTO QUE MUEVES PARA NUESTRO CASETE SEMANAL',
          color: 'black'
        }
      ]
    },
  ],
  agente: [
    {
      name: 'top',
      lines: [{ text: 'PUBLICA UNA FECHA O UNA CONVOCATORIA', color: 'black' }]
    },
    {
      name: 'headline',
      lines: [
        { text: 'PROPÓN UNA', color: 'red' },
        { text: 'ROLA', color: 'red' }
      ]
    },
    {
      name: 'main',
      lines: [
        {
          text: 'DE TU TALENTO QUE MUEVES PARA NUESTRO CASETE SEMANAL',
          color: 'black'
        }
      ]
    },
  ],
  proveedor: [
    {
      name: 'top',
      lines: [{ text: 'PUBLICA UNA PROMO', color: 'black' }]
    },
    {
      name: 'headline',
      lines: [
        { text: 'PROPÓN UNA', color: 'red' },
        { text: 'ROLA', color: 'red' }
      ]
    },
    {
      name: 'main',
      lines: [
        {
          text: 'DE TU BANDA O ARTISTA FAVORITO PARA NUESTRO CASETE SEMANAL',
          color: 'black'
        }
      ]
    },
  ],
  venue: [
    {
      name: 'top',
      lines: [
        {
          text: 'PUBLICA UNA TOCADA O ABRE FECHAS DISPONIBLES',
          color: 'black'
        }
      ]
    },
    {
      name: 'headline',
      lines: [
        { text: 'PROPÓN UNA', color: 'red' },
        { text: 'ROLA', color: 'red' }
      ]
    },
    {
      name: 'main',
      lines: [
        {
          text: 'DE TU BANDA O ARTISTA FAVORITO PARA NUESTRO CASETE SEMANAL',
          color: 'black'
        }
      ]
    },
  ]
}

/** Devuelve las secciones del ticket según el rol. */
export function getTicketSections(role: Role): TicketSection[] {
  return ROLE_TICKET_SECTIONS[role] ?? ROLE_TICKET_SECTIONS.fan
}

/** Secciones por defecto (fan) para compatibilidad. */
export const TICKET_SECTIONS: TicketSection[] = ROLE_TICKET_SECTIONS.fan

const STATIC_TICKET_LINES: Pick<TicketTableRow, 'text' | 'style'>[] = [
  { text: 'CORRE LA VOZ,', style: 'static' },
  { text: 'HAZ RUIDO ALLÁ AFUERA', style: 'static' },
  { text: 'COMPÁRTENOS EN TUS REDES:', style: 'static' },
  { text: 'EXPLORAR LA ESCENA', style: 'cta' },
  { text: 'GRACIAS POR SER', style: 'footer' },
  { text: 'PARTE DEL MOVIMIENTO', style: 'footer' }
]

export function getTicketTableLines(role: Role): TicketTableRow[] {
  const t = ROLE_TICKET[role] ?? ROLE_TICKET.fan
  const rows: TicketTableRow[] = []
  if (t.topLine) rows.push({ text: t.topLine, style: 'top' })
  rows.push({ text: t.headlinePre, style: 'headlinePre' })
  rows.push({
    text: t.headline,
    style: 'headline',
    strikethrough: t.headlineStrikethrough ?? false
  })
  if (t.detail) rows.push({ text: t.detail, style: 'detail' })
  rows.push({ text: t.detailSub, style: 'detailSub' })
  rows.push(...STATIC_TICKET_LINES)
  return rows
}

export const ROLE_TICKET: Record<Role, TicketContent> = {
  fan: {
    topLine: '',
    headlinePre: 'PROPÓN UNA',
    headline: 'ROLA',
    detail: 'de tu banda o artista favorito',
    detailSub: 'para nuestro casete semanal'
  },
  banda: {
    topLine: '',
    headlinePre: 'PROPÓN UNA DE TUS',
    headline: 'ROLAS',
    detail: '',
    detailSub: 'para nuestro casete semanal'
  },
  manager: {
    topLine: '',
    headlinePre: 'PROPÓN UNA',
    headline: 'ROLA',
    detail: 'de tus artistas',
    detailSub: 'para nuestro casete semanal'
  },
  promotor: {
    topLine: 'PUBLICA UNA FECHA O UNA CONVOCATORIA',
    headlinePre: 'PROPÓN UNA',
    headline: 'ROLA',
    detail: 'de tu talento que mueves',
    detailSub: 'para nuestro casete semanal',
    headlineStrikethrough: true
  },
  agente: {
    topLine: 'PUBLICA UNA FECHA O UNA CONVOCATORIA',
    headlinePre: 'PROPÓN UNA',
    headline: 'ROLA',
    detail: 'de tu talento que mueves',
    detailSub: 'para nuestro casete semanal'
  },
  proveedor: {
    topLine: 'PUBLICA UNA PROMO',
    headlinePre: 'PROPÓN UNA',
    headline: 'ROLA',
    detail: 'de tu banda o artista favorito',
    detailSub: 'para nuestro casete semanal'
  },
  venue: {
    topLine: 'PUBLICA UNA TOCADA O ABRE FECHAS DISPONIBLES',
    headlinePre: 'PROPÓN UNA',
    headline: 'ROLA',
    detail: 'de tu banda o artista favorito',
    detailSub: 'para nuestro casete semanal'
  }
}

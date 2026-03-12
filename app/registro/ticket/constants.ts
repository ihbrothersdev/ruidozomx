import type { Role } from '@/lib/types'

export interface TicketContent {
  /** Optional first line above the headline (empty string = hidden) */
  topLine: string
  /** Text before the big bold word (e.g. "PROPÓN UNA" or "PROPÓN UNA DE TUS") */
  headlinePre: string
  /** The big bold word (e.g. "ROLA" or "ROLAS") */
  headline: string
  /** Italic detail below headline — empty string = hidden */
  detail: string
  /** Sub-detail line (e.g. "para nuestro casete semanal") */
  detailSub: string
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
    detail: 'del talento que mueves',
    detailSub: 'para nuestro casete semanal'
  },
  agente: {
    topLine: 'PUBLICA UNA FECHA O UNA CONVOCATORIA',
    headlinePre: 'PROPÓN UNA',
    headline: 'ROLA',
    detail: 'del talento que mueves',
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

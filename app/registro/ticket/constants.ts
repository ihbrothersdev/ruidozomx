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

export type TicketLineColor = 'red' | 'black'

export interface TicketSectionLine {
  text: string
  color: TicketLineColor
}

export interface TicketSection {
  name: string
  lines: TicketSectionLine[]
}
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-friendly slug from a display name.
 * Strips accents, lowercases, replaces spaces/special chars with hyphens,
 * and appends a short random suffix to ensure uniqueness.
 */
export function generateSlug(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

/**
 * Format the current date for the cassette display.
 * Example: "MAYO 2025"
 */
export function formatCassetteDate(): string {
  const months = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE'
  ]
  const now = new Date()
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

const SHORT_MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/**
 * Deterministic short date formatter ("1 abr") that produces identical output
 * on Node.js (server) and any browser (client). We avoid `Intl.DateTimeFormat`
 * because Node's ICU emits "1 de abr." while browsers render "1 abr",
 * triggering React hydration mismatches when the same date is rendered on
 * both sides.
 *
 * Uses UTC to stay independent of server/client timezones.
 */
export function formatShortDateMX(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input)
  return `${d.getUTCDate()} ${SHORT_MONTHS_ES[d.getUTCMonth()]}`
}

/**
 * Deterministic long date formatter ("1 abr 2026") for cards / lists.
 */
export function formatLongDateMX(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input)
  return `${d.getUTCDate()} ${SHORT_MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

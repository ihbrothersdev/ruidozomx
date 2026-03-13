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

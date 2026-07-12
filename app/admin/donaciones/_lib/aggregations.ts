export type DonationEventType = 'donation_start' | 'donation_attempt'

export type DonationEvent = {
  id: string
  type: DonationEventType
  user_id: string | null
  session_id: string | null
  frequency: 'once' | 'monthly' | null
  amount_mxn: number | null
  amount_usd: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type SinceWindow = '24h' | '7d' | '30d' | 'all'

export function windowToDate(window: SinceWindow): Date | null {
  const now = Date.now()
  switch (window) {
    case '24h':
      return new Date(now - 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now - 30 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

export type AmountBreakdown = {
  key: string
  label: string
  frequency: 'once' | 'monthly'
  amount_mxn: number | null
  count: number
}

export type DonationSummary = {
  starts: number
  attempts: number
  /** Share of "Cooperar" openers who went on to pick an amount. */
  conversionRate: number
  authedAttempts: number
  anonAttempts: number
  uniqueSessions: number
  uniqueUsers: number
  onceAttempts: number
  monthlyAttempts: number
  customAttempts: number
  byAmount: AmountBreakdown[]
  // Intent totals, NOT confirmed revenue — Stripe owns the actual charge. A
  // preset-amount click sums here; "otro monto" has no amount so it's excluded.
  oneTimeIntentMxn: number
  monthlyIntentMxn: number
}

function sessionOrUserKey(e: DonationEvent): string | null {
  return e.user_id ?? e.session_id ?? null
}

export function summarizeDonations(events: DonationEvent[]): DonationSummary {
  const starts = events.filter(e => e.type === 'donation_start')
  const attempts = events.filter(e => e.type === 'donation_attempt')

  const amountGroups = new Map<string, AmountBreakdown>()
  let oneTimeIntentMxn = 0
  let monthlyIntentMxn = 0

  for (const a of attempts) {
    const freq: 'once' | 'monthly' = a.frequency === 'monthly' ? 'monthly' : 'once'
    const isCustom = a.amount_mxn == null
    const key = `${freq}:${isCustom ? 'custom' : a.amount_mxn}`
    const label = isCustom ? 'Otro monto' : `$${a.amount_mxn} MXN${freq === 'monthly' ? '/mes' : ''}`

    const existing = amountGroups.get(key)
    if (existing) existing.count++
    else amountGroups.set(key, { key, label, frequency: freq, amount_mxn: a.amount_mxn, count: 1 })

    if (!isCustom) {
      if (freq === 'monthly') monthlyIntentMxn += a.amount_mxn!
      else oneTimeIntentMxn += a.amount_mxn!
    }
  }

  const byAmount = Array.from(amountGroups.values()).sort(
    (x, y) => y.count - x.count || (y.amount_mxn ?? -1) - (x.amount_mxn ?? -1)
  )

  const uniqueSessions = new Set(events.map(sessionOrUserKey).filter(Boolean)).size
  const uniqueUsers = new Set(events.map(e => e.user_id).filter(Boolean)).size
  const authedAttempts = attempts.filter(a => a.user_id).length

  return {
    starts: starts.length,
    attempts: attempts.length,
    conversionRate: starts.length === 0 ? 0 : Math.round((attempts.length / starts.length) * 100),
    authedAttempts,
    anonAttempts: attempts.length - authedAttempts,
    uniqueSessions,
    uniqueUsers,
    onceAttempts: attempts.filter(a => a.frequency !== 'monthly').length,
    monthlyAttempts: attempts.filter(a => a.frequency === 'monthly').length,
    customAttempts: attempts.filter(a => a.amount_mxn == null).length,
    byAmount,
    oneTimeIntentMxn,
    monthlyIntentMxn
  }
}

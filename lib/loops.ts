/**
 * Centralised Loops transactional template IDs.
 *
 * Keeping them here means the IDs are referenced from a single place — if
 * Loops swaps a template, we only update one constant.
 */
export const LOOPS_IDS = {
  /** Sent to the proposer when they submit a song to the cassette queue. */
  PROPOSAL_SUBMITTED: 'cmotgrx7t00dm0i50rnvg1ild',
  /** Sent to the proposer when their song gets accepted into a cassette. */
  PROPOSAL_SELECTED: 'cmo0vgrqu0u480izd8pywerxd',
  /** Sent to a profile owner when someone sends them an interest/connection. */
  INTEREST_RECEIVED: 'cmothhpjc0ima0i4kgs8re0ra'
} as const

type LoopsTransactionalPayload = {
  transactionalId: string
  email: string
  dataVariables?: Record<string, string | number>
}

export async function sendTransactional(payload: LoopsTransactionalPayload) {
  const apiKey = process.env.LOOPS_API_KEY

  if (!apiKey) {
    console.error('[loops] LOOPS_API_KEY is not set')
    return { ok: false as const, error: 'missing_api_key' }
  }

  try {
    const res = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[loops] transactional failed', res.status, body)
      return { ok: false as const, error: `http_${res.status}` }
    }

    return { ok: true as const }
  } catch (err) {
    console.error('[loops] transactional threw', err)
    return { ok: false as const, error: 'fetch_error' }
  }
}

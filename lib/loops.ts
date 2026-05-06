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

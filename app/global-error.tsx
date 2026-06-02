'use client'

import { useEffect } from 'react'

/**
 * Last-resort error boundary that wraps the entire app.
 * Renders only when the root layout itself crashes — must include <html> and <body>.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang='es'>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '24px'
        }}
      >
        <h1 style={{ fontSize: '48px', margin: 0, color: '#dc2626' }}>Error</h1>
        <p style={{ marginTop: 16, opacity: 0.8 }}>Algo salió mal. Intenta recargar la página.</p>
        <button
          type='button'
          onClick={reset}
          style={{
            marginTop: 24,
            padding: '12px 32px',
            border: '2px solid #fff',
            background: 'transparent',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  )
}

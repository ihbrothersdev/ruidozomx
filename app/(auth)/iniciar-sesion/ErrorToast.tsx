'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { sileo } from 'sileo'

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  no_autorizado: {
    title: 'No autorizado',
    description: 'Inicia sesión con una cuenta admin para acceder a esa sección.'
  }
}

export function ErrorToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('e')
  const customMessage = searchParams.get('m')
  const errorMessage = searchParams.get('error')

  useEffect(() => {
    if (!code && !errorMessage) return

    if (code) {
      const mapped = ERROR_MESSAGES[code]
      const title = mapped?.title ?? 'Error'
      const description = mapped?.description ?? customMessage ?? 'Ocurrió un error inesperado. Intenta de nuevo.'
      sileo.error({ title, description, position: 'top-center', duration: 5000 })
    } else if (errorMessage) {
      sileo.error({
        title: 'Error',
        description: errorMessage,
        position: 'top-center',
        duration: 5000
      })
    }

    router.replace('/iniciar-sesion')
  }, [code, customMessage, errorMessage, router])

  return null
}

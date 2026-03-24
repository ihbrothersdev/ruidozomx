'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { sileo } from 'sileo'

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  link_expirado: {
    title: 'Link inválido',
    description: 'El link de confirmación expiró o ya fue usado. Intenta iniciar sesión directamente.'
  },
  no_autorizado: {
    title: 'No autorizado',
    description: 'Tu sesión expiró. Inicia sesión de nuevo.'
  },
  credenciales: {
    title: 'Credenciales incorrectas',
    description: 'Email o contraseña incorrectos.'
  }
}

export function ErrorToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('e')

  useEffect(() => {
    if (!code) return
    const msg = ERROR_MESSAGES[code]
    if (msg) {
      sileo.error({ title: msg.title, description: msg.description, position: 'top-center', duration: 5000 })
    }
    // Limpia la URL sin recargar
    router.replace('/iniciar-sesion')
  }, [code, router])

  return null
}

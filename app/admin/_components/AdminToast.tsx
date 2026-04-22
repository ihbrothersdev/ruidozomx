'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { sileo } from 'sileo'

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  no_cassette_destino: {
    title: 'Sin cassette destino',
    description: 'Marca un cassette como "siguiente" o publica uno nuevo antes de aceptar propuestas.'
  },
  slot_ocupado: {
    title: 'Slot ocupado',
    description: 'Ya hay otra canción en ese lado/posición. Elige otro slot.'
  },
  ya_revisada: {
    title: 'Propuesta ya revisada',
    description: 'Esta propuesta ya fue aceptada o rechazada antes.'
  },
  cassette_vacio: {
    title: 'Cassette vacío',
    description: 'No puedes publicar un cassette sin canciones.'
  },
  sin_borradores: {
    title: 'Sin cassettes en borrador',
    description: 'Crea un cassette nuevo antes de marcarlo como siguiente.'
  },
  cassette_activo: {
    title: 'Cassette activo',
    description: 'No puedes marcar el cassette activo como siguiente.'
  },
  faltan_datos: {
    title: 'Faltan datos',
    description: 'Completa todos los campos requeridos.'
  },
  generico: {
    title: 'Error',
    description: 'Ocurrió un error inesperado. Intenta de nuevo.'
  }
}

const SUCCESS_MESSAGES: Record<string, { title: string; description?: string }> = {
  aceptada: { title: 'Propuesta aceptada', description: 'La canción quedó asignada al cassette.' },
  rechazada: { title: 'Propuesta rechazada' },
  cassette_creado: { title: 'Cassette creado', description: 'Listo para llenar con propuestas.' },
  cassette_publicado: { title: 'Cassette publicado', description: 'Ahora suena en la home.' },
  marcado_siguiente: { title: 'Cassette marcado como siguiente', description: 'Ahí caerán las próximas aceptadas.' },
  cassette_eliminado: { title: 'Cassette eliminado' },
  cancion_removida: { title: 'Canción removida del cassette' }
}

export function AdminToast() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const errCode = params.get('e')
  const okCode = params.get('ok')
  const customMsg = params.get('m')

  useEffect(() => {
    if (!errCode && !okCode) return

    if (errCode) {
      const mapped = ERROR_MESSAGES[errCode] ?? ERROR_MESSAGES.generico
      sileo.error({
        title: mapped.title,
        description: customMsg ?? mapped.description,
        position: 'top-center',
        duration: 5000
      })
    } else if (okCode) {
      const mapped = SUCCESS_MESSAGES[okCode]
      if (mapped) {
        sileo.success({
          title: mapped.title,
          description: customMsg ?? mapped.description,
          position: 'top-center',
          duration: 4000
        })
      }
    }

    router.replace(pathname)
  }, [errCode, okCode, customMsg, router, pathname])

  return null
}

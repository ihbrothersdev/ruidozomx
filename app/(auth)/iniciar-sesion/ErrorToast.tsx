'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { sileo } from 'sileo'

export function ErrorToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const errorMessage = searchParams.get('error')

  useEffect(() => {
    if (!errorMessage) return
    sileo.error({
      title: 'Error',
      description: errorMessage,
      position: 'top-center',
      duration: 5000
    })
    router.replace('/iniciar-sesion')
  }, [errorMessage, router])

  return null
}

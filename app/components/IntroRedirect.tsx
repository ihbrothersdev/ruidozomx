'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const STORAGE_KEY = 'ruidozo_intro_seen'

export function IntroRedirect() {
  const router = useRouter()

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, '1')
        router.replace('/quienes-somos')
      }
    } catch {
      // localStorage not available (incognito, SSR) — skip
    }
  }, [router])

  return null
}

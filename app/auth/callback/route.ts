import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Normalize `next` into a safe same-origin path+search. Accepts either a
 * relative path or an absolute URL on this origin; drops anything else to
 * avoid open-redirect.
 */
function safeNextPath(rawNext: string | null, origin: string, fallback = '/perfil'): string {
  if (!rawNext) return fallback
  if (/^https?:\/\//i.test(rawNext)) {
    try {
      const url = new URL(rawNext)
      if (url.origin !== origin) return fallback
      return url.pathname + url.search + url.hash
    } catch {
      return fallback
    }
  }
  if (rawNext.startsWith('/') && !rawNext.startsWith('//')) return rawNext
  return fallback
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNextPath(searchParams.get('next'), origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // Algo falló — manda al login con código de error
  const errUrl = new URL('/iniciar-sesion', origin)
  errUrl.searchParams.set('e', 'link_expirado')
  return NextResponse.redirect(errUrl)
}

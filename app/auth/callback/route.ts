import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/perfil'

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

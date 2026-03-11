import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateAuthError } from '@/lib/auth-errors'

// Handles PKCE code exchange only (OAuth, magic links).
// Email confirmation (token_hash) is handled by /auth/confirm.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!profile) {
          return NextResponse.redirect(`${origin}/registro/elige-rol`)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    const translatedError = translateAuthError(error.message)
    return NextResponse.redirect(`${origin}/iniciar-sesion?error=${encodeURIComponent(translatedError)}`)
  }

  // No code provided — invalid request
  const translatedError = translateAuthError('unknown error')
  return NextResponse.redirect(`${origin}/iniciar-sesion?error=${encodeURIComponent(translatedError)}`)
}

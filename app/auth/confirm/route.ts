import { translateAuthError } from '@/lib/auth-errors'
import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Normalize whatever arrived in `next` into a safe same-origin path+search.
 *
 * Supabase email templates can pass `next` either as a relative path
 * (`/registro/ticket?role=fan&name=Ivan`) or as a full absolute URL
 * (`https://ruidozo.mx/registro/ticket?...`) depending on how
 * `{{ .RedirectTo }}` is templated. We accept both, and we drop anything
 * pointing off-origin to avoid an open-redirect vulnerability.
 */
function safeNextPath(rawNext: string | null, origin: string, fallback = '/perfil'): string {
  if (!rawNext) return fallback

  // Absolute URL → must match our origin, then strip to path+search.
  if (/^https?:\/\//i.test(rawNext)) {
    try {
      const url = new URL(rawNext)
      if (url.origin !== origin) return fallback
      return url.pathname + url.search + url.hash
    } catch {
      return fallback
    }
  }

  // Relative path — must start with a single `/` (reject `//evil.com`).
  if (rawNext.startsWith('/') && !rawNext.startsWith('//')) {
    return rawNext
  }

  return fallback
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'email' | 'recovery' | 'email_change' | null
  const origin = request.nextUrl.origin
  const next = safeNextPath(searchParams.get('next'), origin)

  if (token_hash && type) {
    // Recovery flow is handled directly at /nueva-contrasena to avoid creating
    // a persistent recovery session — the token_hash is verified at submit time.
    if (type === 'recovery') {
      return NextResponse.redirect(
        `${origin}/nueva-contrasena?token_hash=${encodeURIComponent(token_hash)}&type=recovery`
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error) {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()

        // No profile yet → onboarding is incomplete, send to role-pick.
        // (The `next` is intentionally discarded here.)
        if (!profile) {
          return NextResponse.redirect(`${origin}/registro/elige-rol`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }

    const translatedError = translateAuthError(error.message)
    return NextResponse.redirect(`${origin}/iniciar-sesion?error=${encodeURIComponent(translatedError)}`)
  }

  const translatedError = translateAuthError('unknown error')
  return NextResponse.redirect(`${origin}/iniciar-sesion?error=${encodeURIComponent(translatedError)}`)
}

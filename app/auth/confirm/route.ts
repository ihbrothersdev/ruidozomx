import { createClient } from '@/lib/supabase/server'
import { translateAuthError } from '@/lib/auth-errors'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'email' | 'recovery' | 'email_change' | null
  const next = searchParams.get('next') ?? '/dashboard'
  const origin = request.nextUrl.origin

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    const translatedError = translateAuthError(error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(translatedError)}`)
  }

  const translatedError = translateAuthError('unknown error')
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(translatedError)}`)
}

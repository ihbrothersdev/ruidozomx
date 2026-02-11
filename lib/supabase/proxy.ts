import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseEnv } from './env'

export async function handleProxyRequest(request: NextRequest) {
  // Redirect auth codes to the callback route for session exchange
  const code = request.nextUrl.searchParams.get('code')
  if (code && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/callback'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request
  })

  const { url: supabaseUrl, anonKey } = getSupabaseEnv()

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      }
    }
  })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users trying to access protected routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

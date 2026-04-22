'use server'

import { translateAuthError } from '@/lib/auth-errors'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const lower = error.message.toLowerCase()
    if (lower.includes('invalid login credentials')) {
      redirect('/iniciar-sesion?e=credenciales')
    }
    redirect('/iniciar-sesion?e=error&m=' + encodeURIComponent(translateAuthError(error.message)))
  }

  revalidatePath('/', 'layout')
  redirect('/perfil')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/registrarte?error=' + encodeURIComponent(translateAuthError(error.message)))
  }

  if (signUpData.user && signUpData.user.identities?.length === 0) {
    redirect('/registrarte?error=' + encodeURIComponent('Ya existe una cuenta con este email.'))
  }

  revalidatePath('/', 'layout')
  redirect(
    '/registrarte?message=' +
      encodeURIComponent('Revisa tu email para confirmar tu cuenta. Si no lo encuentras, revisa tu carpeta de spam.')
  )
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const origin = headersList.get('origin') || `${protocol}://${host}`

  const redirectTo = `${origin}/callback`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) {
    return { error: 'Las contraseñas no coinciden.' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/perfil')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

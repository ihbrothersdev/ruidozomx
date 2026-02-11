'use server'

import { translateAuthError } from '@/lib/auth-errors'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(translateAuthError(error.message)))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(translateAuthError(error.message)))
  }

  if (signUpData.user && signUpData.user.identities?.length === 0) {
    redirect('/signup?error=' + encodeURIComponent('Ya existe una cuenta con este email.'))
  }

  revalidatePath('/', 'layout')
  redirect(
    '/signup?message=' +
      encodeURIComponent('Revisa tu email para confirmar tu cuenta. Si no lo encuentras, revisa tu carpeta de spam.')
  )
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

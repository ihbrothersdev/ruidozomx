'use server'

import { translateAuthError } from '@/lib/auth-errors'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { ROLES, type RegistrationSource, type Role } from '@/lib/types'
import { generateSlug } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function getStr(formData: FormData, key: string): string | null {
  const v = formData.get(key) as string | null
  return v?.trim() || null
}

function getBool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'true'
}

function getArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(v => String(v).trim()).filter(Boolean)
}

function buildDisplayName(formData: FormData): string {
  return (
    (formData.get('display_name') as string) ||
    (formData.get('band_name') as string) ||
    (formData.get('full_name') as string) ||
    (formData.get('alias') as string) ||
    (formData.get('venue_name') as string) ||
    (formData.get('brand_name') as string) ||
    ''
  )
}

async function uploadPhoto(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient>,
  userId: string,
  photoData: string
): Promise<string | null> {
  if (!photoData || !photoData.startsWith('data:')) return null

  const match = photoData.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) return null

  const mimeType = match[1]
  const ext = mimeType === 'image/webp' ? 'webp' : mimeType === 'image/png' ? 'png' : 'jpg'
  const buffer = Buffer.from(match[2], 'base64')
  const filePath = `${userId}/avatar.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, { contentType: mimeType, upsert: true })

  if (error) return null

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}

async function upsertRoleProfile(supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient>, role: Role, userId: string, formData: FormData) {
  switch (role) {
    case 'banda':
      return supabase.from('band_profiles').upsert({
        profile_id: userId,
        band_name: getStr(formData, 'band_name') ?? '',
        project_type: getStr(formData, 'project_type'),
        genre: getStr(formData, 'genre'),
        project_link: getStr(formData, 'project_link'),
        available_live: getBool(formData, 'available_live'),
        open_collabs: getBool(formData, 'open_collabs'),
        available_tours: getBool(formData, 'available_tours'),
        willing_travel: getBool(formData, 'willing_travel'),
        review: getStr(formData, 'review'),
        publish_dates: getBool(formData, 'publish_dates'),
        accept_proposals: getBool(formData, 'accept_proposals'),
        contact: getStr(formData, 'contact')
      })

    case 'fan':
      return supabase.from('fan_profiles').upsert({
        profile_id: userId,
        alias: getStr(formData, 'alias') ?? '',
        favorite_genres: getArray(formData, 'favorite_genres'),
        notify_new_bands: getBool(formData, 'notify_new_bands'),
        propose_fav_bands: getBool(formData, 'propose_fav_bands')
      })

    case 'manager':
      return supabase.from('manager_profiles').upsert({
        profile_id: userId,
        full_name: getStr(formData, 'full_name') ?? '',
        web_link: getStr(formData, 'web_link'),
        role_type: 'manager',
        review: getStr(formData, 'review'),
        represents_artists: getBool(formData, 'represents_artists'),
        artists_represented: getStr(formData, 'artists_represented'),
        promote_bands_ruidozo: getBool(formData, 'promote_bands_ruidozo'),
        seeks_emerging_talent: getBool(formData, 'seeks_emerging_talent'),
        accept_proposals: getBool(formData, 'accept_proposals'),
        contact: getStr(formData, 'contact')
      })

    case 'promotor':
      return supabase.from('promoter_profiles').upsert({
        profile_id: userId,
        full_name: getStr(formData, 'full_name') ?? '',
        web_link: getStr(formData, 'web_link'),
        role_type: 'promotor',
        review: getStr(formData, 'review'),
        organizes_events: getBool(formData, 'organizes_events'),
        territorial_reach: getArray(formData, 'territorial_reach'),
        event_types: getArray(formData, 'event_types'),
        provide_events_ruidozo: getBool(formData, 'provide_events_ruidozo'),
        seeks_talent: getBool(formData, 'seeks_talent'),
        accept_proposals: getBool(formData, 'accept_proposals'),
        contact: getStr(formData, 'contact')
      })

    case 'agente':
      return supabase.from('agent_profiles').upsert({
        profile_id: userId,
        full_name: getStr(formData, 'full_name') ?? '',
        web_link: getStr(formData, 'web_link'),
        role_type: 'agente',
        review: getStr(formData, 'review'),
        represents_artists_live: getBool(formData, 'represents_artists_live'),
        territorial_reach: getArray(formData, 'territorial_reach'),
        provide_events_ruidozo: getBool(formData, 'provide_events_ruidozo'),
        seeks_new_projects: getBool(formData, 'seeks_new_projects'),
        accept_proposals: getBool(formData, 'accept_proposals'),
        contact: getStr(formData, 'contact')
      })

    case 'proveedor':
      return supabase.from('provider_profiles').upsert({
        profile_id: userId,
        brand_name: getStr(formData, 'brand_name') ?? '',
        web_link: getStr(formData, 'web_link'),
        description: getStr(formData, 'description'),
        territorial_reach: getArray(formData, 'territorial_reach'),
        service_types: getArray(formData, 'service_types'),
        publish_services: getBool(formData, 'publish_services'),
        accept_proposals: getBool(formData, 'accept_proposals'),
        contact: getStr(formData, 'contact'),
        works_emerging_projects: getBool(formData, 'works_emerging_projects')
      })

    case 'venue':
      return supabase.from('venue_profiles').upsert({
        profile_id: userId,
        venue_name: getStr(formData, 'venue_name') ?? '',
        web_link: getStr(formData, 'web_link'),
        description: getStr(formData, 'description'),
        capacity: getStr(formData, 'capacity'),
        venue_type: getArray(formData, 'venue_type'),
        has_audio: getBool(formData, 'has_audio'),
        has_lighting: getBool(formData, 'has_lighting'),
        accepts_indie_proposals: getBool(formData, 'accepts_indie_proposals'),
        publish_calls_ruidozo: getBool(formData, 'publish_calls_ruidozo'),
        contact: getStr(formData, 'contact')
      })
  }
}

/**
 * Combined signup + profile save.
 * Flow: Formulario (profile data in hidden inputs) → Crear cuenta (email/password) → this action
 */
export async function registroSignup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as Role
  const source = (formData.get('source') as RegistrationSource) || 'registro'

  if (!ROLES.includes(role)) {
    redirect(`/registro/crear-cuenta?role=${role}&source=${source}&error=` + encodeURIComponent('Rol no válido.'))
  }

  const displayName = buildDisplayName(formData)

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role,
        registration_source: source
      }
    }
  })

  if (error) {
    redirect(
      `/registro/crear-cuenta?role=${role}&source=${source}&error=` +
        encodeURIComponent(translateAuthError(error.message))
    )
  }

  if (signUpData.user && signUpData.user.identities?.length === 0) {
    redirect(
      `/registro/crear-cuenta?role=${role}&source=${source}&error=` +
        encodeURIComponent('Ya existe una cuenta con este email.')
    )
  }

  const userId = signUpData.user?.id
  if (userId) {
    const serviceClient = createServiceClient()
    const photoUrl = await uploadPhoto(serviceClient, userId, getStr(formData, 'photo_data') ?? '')

    await serviceClient.from('profiles').upsert({
      id: userId,
      role,
      display_name: displayName,
      slug: generateSlug(displayName),
      photo_url: photoUrl,
      country: getStr(formData, 'country'),
      state: getStr(formData, 'state'),
      city: getStr(formData, 'city'),
      registration_source: source,
      onboarding_complete: false,
      updated_at: new Date().toISOString()
    })

    await upsertRoleProfile(serviceClient, role, userId, formData)
  }

  revalidatePath('/', 'layout')

  if (source === 'propon_rola') {
    redirect('/proponer-rola')
  } else {
    redirect(`/registro/ticket?role=${role}`)
  }
}

/**
 * Save/update profile for an already-authenticated user.
 * Used for profile editing after registration.
 */
export async function submitProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/iniciar-sesion')
  }

  const role = formData.get('role') as Role
  const source = (formData.get('source') as RegistrationSource) || 'registro'
  const displayName = buildDisplayName(formData)
  const photoUrl = await uploadPhoto(supabase, user.id, getStr(formData, 'photo_data') ?? '')

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    role,
    display_name: displayName,
    slug: generateSlug(displayName),
    photo_url: photoUrl,
    country: getStr(formData, 'country'),
    state: getStr(formData, 'state'),
    city: getStr(formData, 'city'),
    registration_source: source,
    onboarding_complete: false,
    updated_at: new Date().toISOString()
  })

  if (profileError) {
    redirect(`/registro/formulario?role=${role}&source=${source}&error=` + encodeURIComponent('Error al guardar perfil. Intenta de nuevo.'))
  }

  await upsertRoleProfile(supabase, role, user.id, formData)

  revalidatePath('/', 'layout')

  if (source === 'propon_rola') {
    redirect('/proponer-rola')
  } else {
    redirect(`/registro/ticket?role=${role}`)
  }
}

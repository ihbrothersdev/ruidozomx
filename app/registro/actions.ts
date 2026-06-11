'use server'

import { translateAuthError } from '@/lib/auth-errors'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ROLES, type RegistrationSource, type Role } from '@/lib/types'
import { generateSlug } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStr(formData: FormData, key: string): string | null {
  const v = formData.get(key) as string | null
  return v?.trim() || null
}

function getBool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'true'
}

function getArray(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map(v => String(v).trim())
    .filter(Boolean)
}

/**
 * Build display_name from whichever field the role's form provides.
 * Priority: explicit display_name > band_name > full_name > alias > venue_name > brand_name
 */
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

/**
 * Build social_links JSONB from form link fields.
 *   project_link        → social_links.project   (banda only — main music link)
 *   web_link            → social_links.web       (manager / promotor / agente / proveedor / venue)
 *   social_<platform>   → social_links[platform] (banda multi-link selector: web, instagram, ...)
 */
function buildSocialLinks(formData: FormData): Record<string, string> {
  const links: Record<string, string> = {}

  const project = getStr(formData, 'project_link')
  if (project) links.project = project

  const web = getStr(formData, 'web_link')
  if (web) links.web = web

  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') continue
    if (!key.startsWith('social_')) continue
    const platform = key.slice('social_'.length)
    if (!platform) continue
    const url = value.trim()
    if (url) links[platform] = url
  }

  return links
}

// ─── Photo upload ──────────────────────────────────────────────────────────────

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

// ─── Role-specific upserts ─────────────────────────────────────────────────────

async function upsertRoleProfile(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient>,
  role: Role,
  userId: string,
  formData: FormData
) {
  switch (role) {
    case 'banda':
      return supabase.from('band_profiles').upsert({
        profile_id: userId,
        project_type: getStr(formData, 'project_type'),
        genre: getStr(formData, 'genre'),
        available_live: getBool(formData, 'available_live'),
        open_collabs: getBool(formData, 'open_collabs'),
        available_tours: getBool(formData, 'available_tours'),
        willing_travel: getBool(formData, 'willing_travel'),
        publish_dates: getBool(formData, 'publish_dates'),
        accept_proposals: getBool(formData, 'accept_proposals')
      })

    case 'fan':
      return supabase.from('fan_profiles').upsert({
        profile_id: userId,
        alias: getStr(formData, 'alias') ?? '',
        favorite_genres: getArray(formData, 'favorite_genres'),
        notify_new_bands: getBool(formData, 'notify_new_bands'),
        propose_fav_bands: getBool(formData, 'propose_fav_bands')
      })

    // manager / promotor / agente share industry_profiles
    // The form role_type dropdown tells us the actual subrole
    case 'manager':
    case 'promotor':
    case 'agente':
      return supabase.from('industry_profiles').upsert({
        profile_id: userId,
        // Manager
        represents_artists: getBool(formData, 'represents_artists'),
        artists_represented: getStr(formData, 'artists_represented'),
        seeks_emerging_talent: getBool(formData, 'seeks_emerging_talent'),
        promote_bands_ruidozo: getBool(formData, 'promote_bands_ruidozo'),
        // Promotor
        organizes_events: getBool(formData, 'organizes_events'),
        event_types: getArray(formData, 'event_types'),
        provide_events_ruidozo: getBool(formData, 'provide_events_ruidozo'),
        seeks_talent: getBool(formData, 'seeks_talent'),
        // Agente
        represents_artists_live: getBool(formData, 'represents_artists_live'),
        seeks_new_projects: getBool(formData, 'seeks_new_projects'),
        // Promotor + Agente
        territorial_reach: getArray(formData, 'territorial_reach'),
        // All
        accept_proposals: getBool(formData, 'accept_proposals')
      })

    case 'proveedor':
      return supabase.from('provider_profiles').upsert({
        profile_id: userId,
        service_types: getArray(formData, 'service_types'),
        territorial_reach: getArray(formData, 'territorial_reach'),
        works_emerging_projects: getBool(formData, 'works_emerging_projects'),
        publish_services: getBool(formData, 'publish_services'),
        accept_proposals: getBool(formData, 'accept_proposals')
      })

    case 'venue':
      return supabase.from('venue_profiles').upsert({
        profile_id: userId,
        capacity: getStr(formData, 'capacity'),
        venue_type: getArray(formData, 'venue_type'),
        has_audio: getBool(formData, 'has_audio'),
        has_lighting: getBool(formData, 'has_lighting'),
        accepts_indie_proposals: getBool(formData, 'accepts_indie_proposals'),
        publish_calls_ruidozo: getBool(formData, 'publish_calls_ruidozo')
      })
  }
}

// ─── Required field per role (sessionStorage guard) ───────────────────────────

const ROLE_REQUIRED_FIELD: Record<Role, string> = {
  fan: 'alias',
  banda: 'band_name',
  manager: 'full_name',
  promotor: 'full_name',
  agente: 'full_name',
  proveedor: 'brand_name',
  venue: 'venue_name',
  admin: ''
}

// ─── registroSignup ────────────────────────────────────────────────────────────

/**
 * Combined signup + profile creation.
 * Flow: formulario (hidden inputs from sessionStorage) → crear-cuenta → this action
 */
export async function registroSignup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const source = (formData.get('source') as RegistrationSource) || 'registro'

  // On local dev and Vercel *preview* deployments we skip the email-confirmation
  // step entirely: after creating the account we auto-confirm it (admin) and
  // sign the tester straight in. NEVER active on production (ruidozo.mx).
  const skipEmailConfirmation =
    process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'

  // role from URL may be 'manager' for all industry sub-roles.
  // role_type from the dropdown is the real subrole.
  const urlRole = formData.get('role') as Role
  const roleType = (getStr(formData, 'role_type') ?? urlRole) as Role
  const actualRole: Role = ['manager', 'promotor', 'agente'].includes(roleType) ? roleType : urlRole

  if (!ROLES.includes(urlRole)) {
    redirect(`/registro/crear-cuenta?role=${urlRole}&source=${source}&error=` + encodeURIComponent('Rol no válido.'))
  }

  // Guard: required role field must be present (sessionStorage was populated)
  if (!getStr(formData, ROLE_REQUIRED_FIELD[urlRole])) {
    redirect(`/registro/elige-rol?source=${source}&toast=noform`)
  }

  const displayName = buildDisplayName(formData)
  const socialLinks = buildSocialLinks(formData)
  const bio = getStr(formData, 'review') ?? getStr(formData, 'description')
  const contact = getStr(formData, 'contact')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ruidozo.mx'

  // After email confirmation we want the user to land on their onboarding
  // ticket — not /perfil — so they don't miss it.
  //
  // The email-confirmation flow is PKCE: Supabase appends `?code=<pkce>` to
  // `emailRedirectTo` and the app must call `exchangeCodeForSession(code)`
  // to create the session cookies. We can't do that exchange on the ticket
  // page itself, so we point Supabase to /auth/callback (which does the
  // exchange) and let the callback forward to the ticket via `next`.
  //
  // NOTE: `${SITE_URL}/auth/callback` (and ideally `${SITE_URL}/registro/ticket*`)
  // must be present in "Redirect URLs" in the Supabase auth settings.
  const ticketPath = `/registro/ticket?role=${actualRole}&name=${encodeURIComponent(displayName)}`
  const callbackUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(ticketPath)}`

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl,
      data: { display_name: displayName, role: actualRole, registration_source: source }
    }
  })

  if (error) {
    redirect(
      `/registro/crear-cuenta?role=${urlRole}&source=${source}&error=` +
        encodeURIComponent(translateAuthError(error.message))
    )
  }

  if (signUpData.user && signUpData.user.identities?.length === 0) {
    redirect(
      `/registro/crear-cuenta?role=${urlRole}&source=${source}&error=` +
        encodeURIComponent('Ya existe una cuenta con este email.')
    )
  }

  const userId = signUpData.user?.id
  if (!userId) {
    redirect(
      `/registro/crear-cuenta?role=${urlRole}&source=${source}&error=` +
        encodeURIComponent('Error inesperado. Intenta de nuevo.')
    )
  }

  try {
    const serviceClient = createServiceClient()
    const photoUrl = await uploadPhoto(serviceClient, userId, getStr(formData, 'photo_data') ?? '')

    // Unique slug — retry up to 5x on collision (generateSlug already adds random suffix)
    let slug = generateSlug(displayName)
    for (let i = 0; i < 4; i++) {
      const { data: existing } = await serviceClient.from('profiles').select('id').eq('slug', slug).maybeSingle()
      if (!existing) break
      slug = generateSlug(displayName)
    }

    const { error: profileError } = await serviceClient.from('profiles').upsert({
      id: userId,
      role: actualRole, // correct subrole (manager/promotor/agente)
      display_name: displayName,
      slug,
      photo_url: photoUrl,
      bio,
      country: getStr(formData, 'country'),
      state: getStr(formData, 'state'),
      city: getStr(formData, 'city'),
      social_links: socialLinks,
      contact,
      registration_source: source,
      onboarding_complete: false,
      updated_at: new Date().toISOString()
    })

    if (profileError) {
      console.error('[registroSignup] Profile upsert error:', profileError)
      redirect(
        `/registro/crear-cuenta?role=${urlRole}&source=${source}&error=` +
          encodeURIComponent('Error al crear tu perfil: ' + profileError.message)
      )
    }

    const roleResult = await upsertRoleProfile(serviceClient, actualRole, userId, formData)
    if (roleResult?.error) {
      console.error('[registroSignup] Role profile upsert error:', roleResult.error)
      redirect(
        `/registro/crear-cuenta?role=${urlRole}&source=${source}&error=` +
          encodeURIComponent('Error al guardar datos del rol: ' + roleResult.error.message)
      )
    }

    // Dev / preview: confirm the email via admin + sign in so the tester
    // lands on the ticket already authenticated, skipping the email step.
    if (skipEmailConfirmation) {
      await serviceClient.auth.admin.updateUserById(userId, { email_confirm: true })
      await supabase.auth.signInWithPassword({ email, password })
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err
    console.error('[registroSignup] Unexpected error:', err)
    redirect(
      `/registro/crear-cuenta?role=${urlRole}&source=${source}&error=` +
        encodeURIComponent('Error inesperado al crear perfil. Intenta de nuevo.')
    )
  }

  revalidatePath('/', 'layout')

  if (source === 'propon_rola') {
    redirect('/proponer-rola')
  } else {
    redirect(`/registro/ticket?role=${actualRole}&name=${encodeURIComponent(displayName)}`)
  }
}

// ─── submitProfile ─────────────────────────────────────────────────────────────

/**
 * Update profile for an already-authenticated user (post-registration editing).
 */
export async function submitProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/iniciar-sesion')

  const urlRole = formData.get('role') as Role
  const roleType = (getStr(formData, 'role_type') ?? urlRole) as Role
  const actualRole: Role = ['manager', 'promotor', 'agente'].includes(roleType) ? roleType : urlRole
  const source = (formData.get('source') as RegistrationSource) || 'registro'

  const displayName = buildDisplayName(formData)
  const socialLinks = buildSocialLinks(formData)
  const bio = getStr(formData, 'review') ?? getStr(formData, 'description')
  const contact = getStr(formData, 'contact')
  const photoUrl = await uploadPhoto(supabase, user.id, getStr(formData, 'photo_data') ?? '')

  // Preserve existing slug — only generate a new one if missing
  const { data: existing } = await supabase.from('profiles').select('slug').eq('id', user.id).single()
  const slug = existing?.slug ?? generateSlug(displayName)

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    role: actualRole,
    display_name: displayName,
    slug,
    photo_url: photoUrl,
    bio,
    country: getStr(formData, 'country'),
    state: getStr(formData, 'state'),
    city: getStr(formData, 'city'),
    social_links: socialLinks,
    contact,
    registration_source: source,
    onboarding_complete: false,
    updated_at: new Date().toISOString()
  })

  if (profileError) {
    redirect(
      `/registro/formulario?role=${urlRole}&source=${source}&error=` +
        encodeURIComponent('Error al guardar perfil. Intenta de nuevo.')
    )
  }

  await upsertRoleProfile(supabase, actualRole, user.id, formData)

  revalidatePath('/', 'layout')

  if (source === 'propon_rola') {
    redirect('/proponer-rola')
  } else {
    redirect(`/registro/ticket?role=${actualRole}&name=${encodeURIComponent(displayName)}`)
  }
}

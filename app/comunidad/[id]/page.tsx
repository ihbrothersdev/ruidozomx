import { Footer } from '@/app/components/layout/Footer'
import { Header } from '@/app/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { ROLE_LABELS, type Role } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params

  const supabase = await createClient()

  // Auth
  let user = null
  let photoUrl: string | null = null
  const { data: authData } = await supabase.auth.getUser()
  user = authData.user
  if (user) {
    const { data: myProfile } = await supabase.from('profiles').select('photo_url').eq('id', user.id).single()
    photoUrl = (myProfile?.photo_url as string) ?? null
  }

  // Fetch the target profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, role, photo_url, city, state, country, bio, social_links, contact, slug, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const role = profile.role as Role
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ')
  const socialLinks = (profile.social_links as Record<string, string>) ?? {}

  return (
    <main className='relative min-h-screen'>
      {/* Background */}
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10 flex min-h-screen flex-col'>
        <Header
          user={user}
          photoUrl={photoUrl}
        />

        <div className='flex-1 px-4 py-6 md:px-8'>
          <div className='mx-auto max-w-2xl'>
            {/* Back */}
            <Link
              href='/comunidad'
              className='font-pt-mono mb-6 inline-flex items-center gap-1 text-xs text-yellow-100/70 uppercase hover:text-yellow-100'
            >
              ← Comunidad
            </Link>

            {/* Card */}
            <div className='border-2 border-red-800/40 bg-amber-50/95 p-6'>
              {/* Header row */}
              <div className='flex gap-4'>
                {/* Photo */}
                <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden border-2 border-red-800/30 bg-amber-100 sm:h-32 sm:w-32'>
                  {profile.photo_url ? (
                    <Image
                      src={profile.photo_url}
                      alt={profile.display_name}
                      fill
                      className='object-cover'
                      unoptimized
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <span className='font-baby-doll text-5xl text-red-300'>
                        {profile.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name + meta */}
                <div className='flex flex-col justify-center'>
                  <span className='font-pt-mono mb-1 inline-block bg-red-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase'>
                    {ROLE_LABELS[role]}
                  </span>
                  <h1 className='font-baby-doll text-3xl leading-tight text-red-900'>{profile.display_name}</h1>
                  {location && <p className='font-pt-mono mt-1 text-xs text-gray-500'>{location}</p>}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className='mt-6 border-t border-red-800/20 pt-4'>
                  <h2 className='font-pt-mono mb-2 text-xs font-bold tracking-wider text-red-700 uppercase'>Reseña</h2>
                  <p className='font-pt-mono text-sm leading-relaxed text-gray-700'>{profile.bio}</p>
                </div>
              )}

              {/* Links */}
              {(socialLinks.web || profile.contact) && (
                <div className='mt-4 border-t border-red-800/20 pt-4'>
                  <h2 className='font-pt-mono mb-2 text-xs font-bold tracking-wider text-red-700 uppercase'>
                    Contacto
                  </h2>
                  <div className='flex flex-col gap-1'>
                    {socialLinks.web && (
                      <a
                        href={socialLinks.web}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='font-pt-mono text-sm text-red-700 underline hover:text-red-900'
                      >
                        {socialLinks.web}
                      </a>
                    )}
                    {profile.contact && <span className='font-pt-mono text-sm text-gray-700'>{profile.contact}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer user={user} />
      </div>
    </main>
  )
}

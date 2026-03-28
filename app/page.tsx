import { MOCK_PLAYER_STATE, MOCK_SONGS } from '@/lib/mock-data'
import { formatCassetteDate } from '@/lib/utils'
import Image from 'next/image'
import { IntroRedirect } from './components/IntroRedirect'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { SomosTrinchera } from './components/layout/SomosTrinchera'
import { ExplorarComunidad } from './components/player/ExplorarComunidad'
import { HomePlayerSection } from './components/player/HomePlayerSection'

export default async function Home() {
  let user = null
  let photoUrl: string | null = null
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('photo_url').eq('id', user.id).single()
      photoUrl = (profile?.photo_url as string) || null
    }
  } catch {
    // Supabase not configured — continue without auth
  }

  return (
    <main className='relative min-h-screen'>
      <IntroRedirect />
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10 overflow-x-hidden'>
        <div className='absolute top-0 left-2 z-0 hidden lg:block'>
          <Image
            src='/assets/decorativos/pedazo-de-papel.png'
            alt=''
            width={521}
            height={1179}
            className='w-full'
            unoptimized
          />
          <div className='absolute top-205 left-55 z-0 hidden lg:block'>
            <Image
              src='/assets/body1/mientras-suena.png'
              alt='Mientras suena'
              width={230}
              height={159}
              unoptimized
            />
          </div>
        </div>
        <Header
          user={user}
          photoUrl={photoUrl}
        />

        <HomePlayerSection
          songs={MOCK_SONGS}
          initialSongId={MOCK_PLAYER_STATE.currentSongId}
          date={formatCassetteDate()}
          isAuthenticated={!!user}
        />

        {/* Explorar Comunidad - left side */}
        <div className='absolute top-330 left-5 z-0 hidden lg:block'>
          <ExplorarComunidad />
        </div>

        {/* Rocket man - right side */}
        <div className='absolute top-250 -right-15 z-0 hidden lg:block'>
          <Image
            src='/assets/decorativos/cohete.png'
            alt=''
            width={384}
            height={839}
            className='w-full'
            unoptimized
          />
        </div>

        <SomosTrinchera />

        <Footer user={user} />
      </div>
    </main>
  )
}

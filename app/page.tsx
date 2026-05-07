import { createClient } from '@/lib/supabase/server'
import { getActiveCassetteSongs } from '@/lib/supabase/songs'
import { formatCassetteDate } from '@/lib/utils'
import Image from 'next/image'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { SomosTrinchera } from './components/layout/SomosTrinchera'
import { ExplorarComunidad } from './components/player/ExplorarComunidad'
import { HomePlayerSection } from './components/player/HomePlayerSection'

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

export default async function Home() {
  let user = null
  let photoUrl: string | null = null
  let userRole: string | null = null

  if (isSupabaseConfigured) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('photo_url, role').eq('id', user.id).single()
      photoUrl = (profile?.photo_url as string) || null
      userRole = (profile?.role as string) || null
    }
  }

  const { songs } = await getActiveCassetteSongs()

  return (
    <main className='relative min-h-screen'>
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10 overflow-x-hidden'>
        <div className='absolute top-0 left-2 z-0 max-[1450px]:hidden min-[1450px]:w-[420px] 2xl:w-[520px] min-[1728px]:w-[620px] min-[1920px]:w-[700px]'>
          <Image
            src='/assets/decorativos/pedazo-de-papel.png'
            alt=''
            width={521}
            height={1179}
            className='h-auto w-full'
          />
          <div className='absolute top-205 left-55 z-0 max-[1450px]:hidden'>
            <Image
              src='/assets/body1/mientras-suena.png'
              alt='Mientras suena'
              width={230}
              height={159}
            />
          </div>
        </div>
        <Header
          user={user}
          photoUrl={photoUrl}
          role={userRole}
        />

        {songs.length > 0 && (
          <HomePlayerSection
            songs={songs}
            initialSongId={songs[0].id}
            date={formatCassetteDate()}
            isAuthenticated={!!user}
          />
        )}

        {/* Explorar Comunidad - centered on mobile/tablet, left side on wide desktop */}
        <div className='flex justify-center xl:absolute xl:top-330 xl:left-5 xl:z-0 xl:block'>
          <ExplorarComunidad />
        </div>

        {/* Rocket man - right side */}
        <div className='absolute top-230 -right-15 z-0 hidden xl:block xl:w-[320px] 2xl:w-[400px] min-[1728px]:w-[480px] min-[1920px]:w-[540px]'>
          <Image
            src='/assets/decorativos/cohete.png'
            alt=''
            width={384}
            height={839}
            className='h-auto w-full'
          />
        </div>

        <SomosTrinchera />

        <Footer user={user} />
      </div>
    </main>
  )
}

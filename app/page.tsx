import { createClient } from '@/lib/supabase/server'
import { CassettePlayer } from './components/player/CassettePlayer'
import { Header } from './components/layout/Header'
import { MOCK_SONGS, MOCK_PLAYER_STATE } from '@/lib/mock-data'
import { Footer } from './components/layout/Footer'
import { SomosTrinchera } from './components/layout/SomosTrinchera'
import { SongList } from './components/player/SongList'
import { ExplorarComunidad } from './components/player/ExplorarComunidad'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return (
    <main className='relative min-h-screen'>
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10'>
        <Header user={user} />

        {/* Body 1: Cassette player area */}
        <section className='relative flex flex-col items-center px-4 pt-4 pb-8'>
          <div className='relative mx-auto w-full max-w-5xl'>
            <div className='flex justify-center'>
              <CassettePlayer
                songs={MOCK_SONGS}
                playerState={MOCK_PLAYER_STATE}
              />
            </div>
          </div>
        </section>

         {/* Body 2: Song list + community */}
        <section className='relative px-4 py-8'>
          <div className='relative mx-auto max-w-5xl'>

            {/* Explorar comunidad + Song list side by side */}
            <div className='flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center'>
              <div className='hidden md:block'>
                <ExplorarComunidad />
              </div>
              <div className='w-full max-w-[793px] flex-1'>
                <SongList
                  songs={MOCK_SONGS}
                  currentSongId={MOCK_PLAYER_STATE.currentSongId}
                />
              </div>
            </div>
          </div>

          <SomosTrinchera />
        </section>

        <Footer />
      </div>
    </main>
  )
}

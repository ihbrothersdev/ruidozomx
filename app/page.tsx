import { createClient } from '@/lib/supabase/server'
import { CassettePlayer } from './components/player/CassettePlayer'
import { Header } from './components/layout/Header'
import { MOCK_SONGS, MOCK_PLAYER_STATE } from '@/lib/mock-data'

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

        <section className='flex flex-col items-center px-4 pt-4 pb-8'>
          <CassettePlayer
            songs={MOCK_SONGS}
            playerState={MOCK_PLAYER_STATE}
          />
        </section>

        {/* <section className='relative px-4 py-8'>
          <div className='relative mx-auto max-w-5xl'>
            <DecorativeElements />

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

        <Footer /> */}
      </div>
    </main>
  )
}

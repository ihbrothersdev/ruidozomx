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

        {/* Test paragraph for font verification */}
        <section className='relative flex flex-col items-center px-4 pb-8'>
          <p className='text-white text-2xl text-center'>
            Este es un párrafo de prueba para verificar la fuente Corose. ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
          </p>
        </section>
      </div>
    </main>
  )
}

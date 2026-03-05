import { createClient } from '@/lib/supabase/server'
import { Header } from './components/layout/Header'
import { MOCK_SONGS, MOCK_PLAYER_STATE } from '@/lib/mock-data'
import { formatCassetteDate } from '@/lib/utils'
import { Footer } from './components/layout/Footer'
import { SomosTrinchera } from './components/layout/SomosTrinchera'
import { HomePlayerSection } from './components/player/HomePlayerSection'
import { DecorativeElements } from './components/player/DecorativeElements'

export default async function Home() {
  let user = null
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase not configured — continue without auth
  }
  
  return (
    <main className='relative min-h-screen'>
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10 overflow-x-hidden'>
        <DecorativeElements />
        <Header user={user} />

        <HomePlayerSection
          songs={MOCK_SONGS}
          initialSongId={MOCK_PLAYER_STATE.currentSongId}
          date={formatCassetteDate()}
        />

        <SomosTrinchera />

        <Footer />
      </div>
    </main>
  )
}

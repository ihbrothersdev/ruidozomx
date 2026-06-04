import { createClient } from '@/lib/supabase/server'
import { getActiveCassetteSongs, getCassetteContextById, getCassetteContextForSong } from '@/lib/supabase/songs'
import { formatCassetteDate } from '@/lib/utils'
import Image from 'next/image'
import { IntroRedirect } from './components/IntroRedirect'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { SomosTrinchera } from './components/layout/SomosTrinchera'
import { ExplorarComunidad } from './components/player/ExplorarComunidad'
import { HomePlayerSection } from './components/player/HomePlayerSection'

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

interface HomeProps {
  searchParams: Promise<{ song?: string; cassette?: string; q?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { song: requestedSongId, cassette: requestedCassetteId } = await searchParams

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

  // If the URL points at a specific song or cassette (search dropdown), load
  // *that* cassette so prev/next stays coherent — a song opens on its track, a
  // cassette opens on its first. Falls back to the active cassette when the id
  // is unknown. Searched/archived cassettes play in legacy per-song mode (no
  // concat URL); only the active cassette streams the concatenated file.
  const requested = requestedSongId
    ? await getCassetteContextForSong(requestedSongId)
    : requestedCassetteId
      ? await getCassetteContextById(requestedCassetteId)
      : null
  const { songs, cassetteId, cassetteStartDate, initialSongId, autoPlay, cassetteActive, concatAudioUrl } = requested
    ? {
        songs: requested.songs,
        cassetteId: null as string | null,
        cassetteStartDate: requested.cassetteStartDate,
        initialSongId: requested.initialSongId,
        autoPlay: true,
        cassetteActive: requested.cassetteActive,
        concatAudioUrl: null as string | null
      }
    : await (async () => {
        const active = await getActiveCassetteSongs()
        return {
          songs: active.songs,
          cassetteId: active.cassetteId,
          cassetteStartDate: active.cassetteStartDate,
          initialSongId: active.songs[0]?.id ?? '',
          autoPlay: false,
          cassetteActive: true,
          concatAudioUrl: active.concatAudioUrl
        }
      })()

  return (
    <main className='relative min-h-screen'>
      <IntroRedirect />
      <div
        className='fixed inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/assets/textura/background-textura.jpg')" }}
      />

      <div className='relative z-10 overflow-x-hidden'>
        <div className='absolute top-0 left-2 z-0 max-[1450px]:hidden min-[1450px]:w-[420px] min-[1728px]:w-[620px] min-[1920px]:w-[700px] 2xl:w-[520px]'>
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
            initialSongId={initialSongId || songs[0].id}
            date={formatCassetteDate(cassetteStartDate)}
            isAuthenticated={!!user}
            autoPlay={autoPlay}
            cassetteActive={cassetteActive}
            cassetteId={cassetteId}
            concatAudioUrl={concatAudioUrl}
          />
        )}

        {/* Explorar Comunidad - centered on mobile/tablet, left side on wide desktop */}
        <div className='flex justify-center xl:absolute xl:top-330 xl:left-5 xl:z-0 xl:block'>
          <ExplorarComunidad />
        </div>

        {/* Rocket man - right side */}
        <div className='absolute top-230 -right-15 z-0 hidden min-[1728px]:w-[480px] min-[1920px]:w-[540px] xl:block xl:w-[320px] 2xl:w-[400px]'>
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

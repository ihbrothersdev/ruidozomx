import { getActiveCassetteSongs } from '@/lib/supabase/songs'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Toaster } from 'sileo'
import { AudioProvider } from './components/AudioProvider'
import { PersistentPlayerBar } from './components/player-bar/PersistentPlayerBar'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ruidozo.mx'
const SITE_NAME = 'Ruidozo MX'
const SITE_DESCRIPTION =
  'Cassette semanal de música mexicana independiente. Descubre, propón y comparte rolas de la escena underground.'

const corose = localFont({
  src: '../public/assets/fonts/Corose.otf',
  variable: '--font-corose',
  display: 'swap'
})

const coroseAlt01 = localFont({
  src: '../public/assets/fonts/Corose-Alt01.otf',
  variable: '--font-corose-alt01',
  display: 'swap'
})

const coroseAlt02 = localFont({
  src: '../public/assets/fonts/Corose-Alt02.otf',
  variable: '--font-corose-alt02',
  display: 'swap'
})

const thanjhirsBrush = localFont({
  src: '../public/assets/fonts/ThanjhirsBrush.otf',
  variable: '--font-thanjhirs-brush',
  display: 'swap'
})

const babyDoll = localFont({
  src: '../public/assets/fonts/BabyDoll.otf',
  variable: '--font-baby-doll',
  display: 'swap'
})

const impactLabel = localFont({
  src: '../public/assets/fonts/ImpactLabelReversed.ttf',
  variable: '--font-impact-label',
  display: 'swap'
})

const akzidenzGrotesk = localFont({
  src: '../public/assets/fonts/Akzidenz-Grotesk.ttf',
  variable: '--font-akzidenz',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['música mexicana', 'indie', 'underground', 'cassette', 'mixtape', 'México', 'escena independiente'],
  authors: [{ name: 'Ruidozo MX' }],
  creator: 'Ruidozo MX',
  publisher: 'Ruidozo MX',
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/assets/media-artwork.png',
        width: 512,
        height: 512,
        alt: SITE_NAME
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/assets/media-artwork.png']
  },
  icons: {
    icon: '/favicon.ico'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  // The live cassette is the global default the persistent bar plays on every
  // page; individual pages (e.g. an archived cassette on home) can swap it.
  const { songs, cassetteId, concatAudioUrl } = await getActiveCassetteSongs()

  return (
    <html
      lang='es'
      className='h-full'
    >
      <body
        className={`${corose.variable} ${coroseAlt01.variable} ${coroseAlt02.variable} ${thanjhirsBrush.variable} ${babyDoll.variable} ${impactLabel.variable} ${akzidenzGrotesk.variable} min-h-screen pb-40 antialiased md:pb-16`}
      >
        <AudioProvider
          songs={songs}
          cassetteId={cassetteId}
          concatAudioUrl={concatAudioUrl}
        >
          {children}
          <PersistentPlayerBar />
        </AudioProvider>
        <Toaster position='top-center' />
      </body>
    </html>
  )
}

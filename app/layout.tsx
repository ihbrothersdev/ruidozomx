import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from 'sileo'
import './globals.css'

const corose = localFont({
  src: './fonts/Corose.otf',
  variable: '--font-corose',
  display: 'swap'
})

const coroseAlt01 = localFont({
  src: './fonts/Corose-Alt01.otf',
  variable: '--font-corose-alt01',
  display: 'swap'
})

const coroseAlt02 = localFont({
  src: './fonts/Corose-Alt02.otf',
  variable: '--font-corose-alt02',
  display: 'swap'
})

const thanjhirsBrush = localFont({
  src: './fonts/ThanjhirsBrush.otf',
  variable: '--font-thanjhirs-brush',
  display: 'swap'
})

const babyDoll = localFont({
  src: './fonts/BabyDoll.otf',
  variable: '--font-baby-doll',
  display: 'swap'
})

const impactLabel = localFont({
  src: './fonts/ImpactLabelReversed.ttf',
  variable: '--font-impact-label',
  display: 'swap'
})

const akzidenzGrotesk = localFont({
  src: './fonts/Akzidenz-Grotesk.ttf',
  variable: '--font-akzidenz',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Ruidozo MX'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='es'
      className='h-full'
    >
      <body
        className={`${corose.variable} ${coroseAlt01.variable} ${coroseAlt02.variable} ${thanjhirsBrush.variable} ${babyDoll.variable} ${impactLabel.variable} ${akzidenzGrotesk.variable} min-h-screen antialiased`}
      >
        {children}
        <Toaster position='top-center' />
      </body>
    </html>
  )
}

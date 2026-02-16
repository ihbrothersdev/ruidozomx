import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const corose = localFont({
  src: [
    {
      path: '../public/fonts/Corose.otf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../public/fonts/Corose-Alt01.otf',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../public/fonts/Corose-Alt02.otf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-corose'
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
    <html lang='en'>
      <body className={`${corose.className} antialiased`}>{children}</body>
    </html>
  )
}

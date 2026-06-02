import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '¿Quiénes somos?',
  description:
    'Ruidozo MX es la trinchera de la música mexicana independiente. Conoce nuestra misión, manifiesto y cómo formamos comunidad.'
}

export default function QuienesSomosLayout({ children }: { children: React.ReactNode }) {
  return children
}

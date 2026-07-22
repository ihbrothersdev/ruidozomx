import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Proponer rola',
  description: 'Propón tu rola para el próximo cassette quincenal de RU!DOZO'
}

export default function ProponerRolaLayout({ children }: { children: React.ReactNode }) {
  return children
}

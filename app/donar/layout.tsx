import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coperacha — Ayuda a que el fuego sea más grande',
  description: 'Tu cooperación ayuda a mantener vivo Ruidozo MX: desarrollo, servidores, difusión y más.'
}

export default function DonarLayout({ children }: { children: React.ReactNode }) {
  return children
}

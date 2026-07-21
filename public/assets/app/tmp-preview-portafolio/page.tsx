'use client'
import { useState } from 'react'
import PortafolioModal from '@/app/perfil/_components/PortafolioModal'

export default function P() {
  const [open, setOpen] = useState(true)
  return (
    <main className='min-h-screen bg-neutral-800 p-10'>
      <button onClick={() => setOpen(true)} className='rounded bg-white px-4 py-2'>Abrir</button>
      <PortafolioModal open={open} onOpenChange={setOpen} />
    </main>
  )
}

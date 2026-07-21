'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Role } from '@/lib/types'
import ComparteTuEventoModal from './ComparteTuEventoModal'
import ProponerRolaBandaModal from './ProponerRolaBandaModal'

interface OwnProfileActionsProps {
  role: Role | null
  /** Switches the dashboard into inline edit mode (ProfileView form). */
  onEdit: () => void
  /** Opens the shared portfolio-quote modal (owned by OwnProfileView — this
   *  component renders twice, mobile + desktop, so the modal can't live here
   *  without risking two mounted at once). */
  onOpenPortafolio: () => void
}

/**
 * The right-column action panel on the private profile dashboard.
 * Two of the buttons navigate (Explorar comunidad, Editar perfil) and the
 * other two open modals (Proponer rola, Publicar evento) — that's why this
 * is a client component.
 *
 * Fans can't publish events, so the "Publicar evento" button is hidden for them.
 */
export default function OwnProfileActions({ role, onEdit, onOpenPortafolio }: OwnProfileActionsProps) {
  const [proponerRolaOpen, setProponerRolaOpen] = useState(false)
  const [publicarEventoOpen, setPublicarEventoOpen] = useState(false)

  const canPublishEvents = role !== 'fan'

  const buttonCls =
    'font-pt-mono block w-68 cursor-pointer bg-black px-3 py-1 text-right text-lg font-bold tracking-wider text-red-700 uppercase transition-opacity hover:opacity-80 active:scale-[0.98] sm:text-lg md:text-xl'

  return (
    <div className='space-y-1'>
      <Link
        href='/comunidad'
        className={buttonCls}
      >
        Explorar comunidad
      </Link>

      <button
        type='button'
        onClick={() => setProponerRolaOpen(true)}
        className={buttonCls}
      >
        Proponer rola
      </button>

      {canPublishEvents && (
        <button
          type='button'
          onClick={() => setPublicarEventoOpen(true)}
          className={buttonCls}
        >
          Publicar evento
        </button>
      )}

      <button
        type='button'
        onClick={onEdit}
        className={buttonCls}
      >
        Editar perfil
      </button>

      {/* Portfolio CTA — "¿Tu proyecto necesita IMAGEN?" (text baked into the asset) */}
      <div className='flex w-68 flex-col items-center gap-1.5 pt-5'>
        <Image
          src='/assets/portafolio/imagen.png'
          alt='¿Tu proyecto necesita imagen?'
          width={180}
          height={95}
          className='w-36'
          style={{ height: 'auto' }}
        />
        <button
          type='button'
          onClick={onOpenPortafolio}
          className='cursor-pointer transition-transform hover:scale-105 active:scale-95'
        >
          <Image
            src='/assets/portafolio/aqui-btn.png'
            alt='Aquí'
            width={134}
            height={42}
            className='w-24'
            style={{ height: 'auto' }}
          />
        </button>
      </div>

      {/* Modals */}
      <ProponerRolaBandaModal
        open={proponerRolaOpen}
        onOpenChange={setProponerRolaOpen}
        bandName=''
        showVibes={false}
      />
      <ComparteTuEventoModal
        open={publicarEventoOpen}
        onOpenChange={setPublicarEventoOpen}
      />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AdminButton } from '@/app/admin/_components/kit'
import type { Role } from '@/lib/types'
import ComparteTuEventoModal from './ComparteTuEventoModal'
import ProponerRolaBandaModal from './ProponerRolaBandaModal'

interface OwnProfileActionsProps {
  role: Role | null
  /** Switches the dashboard into inline edit mode (ProfileView form). */
  onEdit: () => void
}

/**
 * The right-column action panel on the private profile dashboard.
 * Two of the buttons navigate (Explorar comunidad, Editar perfil) and the
 * other two open modals (Proponer rola, Publicar evento) — that's why this
 * is a client component.
 *
 * Fans can't publish events, so the "Publicar evento" button is hidden for them.
 */
export default function OwnProfileActions({ role, onEdit }: OwnProfileActionsProps) {
  const [proponerRolaOpen, setProponerRolaOpen] = useState(false)
  const [publicarEventoOpen, setPublicarEventoOpen] = useState(false)

  const canPublishEvents = role !== 'fan'

  const actionCls = 'w-full justify-center'

  return (
    <div className='w-64 space-y-2'>
      <AdminButton
        asChild
        variant='solid'
        size='lg'
        className={actionCls}
      >
        <Link href='/comunidad'>Explorar comunidad</Link>
      </AdminButton>

      <AdminButton
        type='button'
        variant='solid'
        size='lg'
        className={actionCls}
        onClick={() => setProponerRolaOpen(true)}
      >
        Proponer rola
      </AdminButton>

      {canPublishEvents && (
        <AdminButton
          type='button'
          variant='solid'
          size='lg'
          className={actionCls}
          onClick={() => setPublicarEventoOpen(true)}
        >
          Publicar evento
        </AdminButton>
      )}

      <AdminButton
        type='button'
        variant='primary'
        size='lg'
        className={actionCls}
        onClick={onEdit}
      >
        Editar perfil
      </AdminButton>

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

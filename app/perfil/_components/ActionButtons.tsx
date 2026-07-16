'use client'

import { AdminButton } from '@/app/admin/_components/kit'
import type { Role } from '@/lib/types'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import ComparteTuEventoModal from './ComparteTuEventoModal'
import ConectarModal from './ConectarModal'
import EnviarPropuestaModal from './EnviarPropuestaModal'
import ProponerRolaBandaModal from './ProponerRolaBandaModal'

interface ActionButtonsProps {
  profileId?: string
  isOwnProfile: boolean
  isLoggedIn: boolean
  role: Role | null
  acceptProposals: boolean
  displayName?: string
  alreadySent?: { proposal: boolean; sendInterest: boolean }
  editing?: boolean
}

export default function ActionButtons({
  profileId,
  isOwnProfile,
  isLoggedIn,
  role,
  acceptProposals,
  displayName = '',
  alreadySent,
  editing = false
}: ActionButtonsProps) {
  const [proponerRolaOpen, setProponerRolaOpen] = useState(false)
  const [enviarPropuestaOpen, setEnviarPropuestaOpen] = useState(false)
  const [conectarOpen, setConectarOpen] = useState(false)
  const [compartirEventoOpen, setCompartirEventoOpen] = useState(false)
  const [proposalSent, setProposalSent] = useState(false)
  const [interestSent, setInterestSent] = useState(false)

  const isProposalDisabled = alreadySent?.proposal || proposalSent
  const isInterestDisabled = alreadySent?.sendInterest || interestSent

  // Mirrors the render conditions below — if none apply, skip rendering the
  // wrapper entirely so it doesn't leave a phantom flex child in the right
  // column (which would steal a slot in `gap` / `justify-between` layouts).
  const showProposalAndConnect = role !== 'fan' && !isOwnProfile && !editing
  const showProponerRolaForOther = role === 'banda' && !isOwnProfile
  const showOwnBandaActions = role === 'banda' && isOwnProfile && !editing
  if (!showProposalAndConnect && !showProponerRolaForOther && !showOwnBandaActions) {
    return null
  }

  return (
    <div className='flex flex-col items-center space-y-3 lg:items-start'>
      {showProposalAndConnect && (
        <>
          <AdminButton
            variant='solid'
            size='lg'
            onClick={!isLoggedIn ? () => redirect('/iniciar-sesion') : () => setEnviarPropuestaOpen(true)}
            disabled={isProposalDisabled}
            className='w-70 justify-start'
          >
            {isProposalDisabled ? 'Propuesta enviada' : 'Enviar propuesta'}
          </AdminButton>
          <AdminButton
            variant='solid'
            size='lg'
            onClick={!isLoggedIn ? () => redirect('/iniciar-sesion') : () => setConectarOpen(true)}
            disabled={isInterestDisabled}
            className='w-70 justify-start'
          >
            {isInterestDisabled ? 'Conexión enviada' : 'Conectar'}
          </AdminButton>
          <EnviarPropuestaModal
            open={enviarPropuestaOpen}
            onOpenChange={setEnviarPropuestaOpen}
            profileId={profileId}
            profileName={displayName}
            profileRole={role}
            onSuccess={() => setProposalSent(true)}
          />
          <ConectarModal
            open={conectarOpen}
            onOpenChange={setConectarOpen}
            profileId={profileId}
            profileName={displayName}
            onSuccess={() => setInterestSent(true)}
          />
        </>
      )}

      {role === 'banda' &&
        (!isOwnProfile ? (
          <>
            <button
              type='button'
              onClick={!isLoggedIn ? () => redirect('/registro/elige-rol') : () => setProponerRolaOpen(true)}
              className='block w-70 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95'
            >
              <Image
                src='/assets/proponer-rola-banda.png'
                alt='Proponer rola de esta banda'
                width={600}
                height={120}
                className='h-auto w-full'
              />
            </button>
            <ProponerRolaBandaModal
              open={proponerRolaOpen}
              onOpenChange={setProponerRolaOpen}
              bandName={displayName}
            />
          </>
        ) : (
          !editing && (
            <>
              <button
                type='button'
                onClick={() => redirect('/proponer-rola')}
                className='block w-70 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95'
              >
                <Image
                  src='/assets/proponer-rola-sm.png'
                  alt='Propón una rola'
                  width={315}
                  height={57}
                  className='h-auto w-full max-w-64 sm:max-w-72'
                />
              </button>
              <AdminButton
                variant='solid'
                size='lg'
                onClick={() => setCompartirEventoOpen(true)}
                className='w-70 justify-start whitespace-nowrap'
              >
                Publicar fecha o convocatoria
              </AdminButton>
              <ComparteTuEventoModal
                open={compartirEventoOpen}
                onOpenChange={setCompartirEventoOpen}
              />
            </>
          )
        ))}
    </div>
  )
}

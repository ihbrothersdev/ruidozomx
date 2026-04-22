'use client'

import { useState } from 'react'
import type { Role } from '@/lib/types'
import { redirect } from 'next/navigation'
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
}

export default function ActionButtons({ profileId, isOwnProfile, isLoggedIn, role, acceptProposals, displayName = '', alreadySent }: ActionButtonsProps) {
  const [proponerRolaOpen, setProponerRolaOpen] = useState(false)
  const [enviarPropuestaOpen, setEnviarPropuestaOpen] = useState(false)
  const [conectarOpen, setConectarOpen] = useState(false)
  const [proposalSent, setProposalSent] = useState(false)
  const [interestSent, setInterestSent] = useState(false)

  const isProposalDisabled = alreadySent?.proposal || proposalSent
  const isInterestDisabled = alreadySent?.sendInterest || interestSent

  // TODO: Add functionality later, not part of MVP.
  // if (isOwnProfile) {
  //   return (
  //     <div className='flex flex-wrap gap-3'>
  //       <Link
  //         href='/perfil/editar'
  //         className='font-pt-mono rounded-sm border-2 border-black bg-black px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80'
  //       >
  //         Editar perfil
  //       </Link>
  //     </div>
  //   )
  // }

  return (
    <div className='space-y-3'>
      {role !== 'fan' && !isOwnProfile && (
        <>
          <button
            onClick={!isLoggedIn ? () => redirect('/iniciar-sesion') : () => setEnviarPropuestaOpen(true)}
            disabled={isProposalDisabled}
            className='font-pt-mono block w-full cursor-pointer rounded-sm border-2 border-black bg-black px-6 py-2.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isProposalDisabled ? 'Propuesta enviada' : 'Enviar propuesta'}
          </button>
          <button
            onClick={!isLoggedIn ? () => redirect('/iniciar-sesion') : () => setConectarOpen(true)}
            disabled={isInterestDisabled}
            className='font-pt-mono block w-full cursor-pointer rounded-sm border-2 border-black bg-black px-6 py-2.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isInterestDisabled ? 'Conexión enviada' : 'Conectar'}
          </button>
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

      {/* Banda-specific: "Proponer rola de esta banda" */}
      {role === 'banda' && (
        <>
          <button
            onClick={() => setProponerRolaOpen(true)}
            className='font-pt-mono block w-full cursor-pointer rounded-sm bg-red-600 px-6 py-2.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-red-700'
          >
            Proponer rola de esta banda
          </button>
          <ProponerRolaBandaModal
            open={proponerRolaOpen}
            onOpenChange={setProponerRolaOpen}
            bandName={displayName}
          />
        </>
      )}
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { sileo } from 'sileo'
import { respondToProposal, withdrawProposal } from '../actions'
import ConfirmActionModal from './ConfirmActionModal'

interface ProposalActionsProps {
  proposalId: string
  displayName: string
  direction: 'received' | 'sent'
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
}

export default function ProposalActions({ proposalId, displayName, direction, status }: ProposalActionsProps) {
  const router = useRouter()
  const [confirmReject, setConfirmReject] = useState(false)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (status !== 'pending') return null

  function handleAccept() {
    startTransition(async () => {
      const result = await respondToProposal({ proposalId, status: 'accepted' })
      if (result.error) {
        sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
        return
      }
      router.refresh()
    })
  }

  function handleReject() {
    startTransition(async () => {
      const result = await respondToProposal({ proposalId, status: 'rejected' })
      if (result.error) {
        sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
        return
      }
      setConfirmReject(false)
      router.refresh()
    })
  }

  function handleWithdraw() {
    startTransition(async () => {
      const result = await withdrawProposal({ proposalId })
      if (result.error) {
        sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
        return
      }
      setConfirmWithdraw(false)
      router.refresh()
    })
  }

  return (
    <div className='mt-1 flex flex-wrap gap-2'>
      {direction === 'received' && (
        <>
          <button
            type='button'
            onClick={handleAccept}
            disabled={isPending}
            className='font-pt-mono cursor-pointer rounded-sm bg-green-600 px-3 py-1 text-[11px] font-bold tracking-wider whitespace-nowrap text-white uppercase transition-colors hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Aceptar
          </button>
          <button
            type='button'
            onClick={() => setConfirmReject(true)}
            disabled={isPending}
            className='font-pt-mono cursor-pointer rounded-sm border border-red-600 px-3 py-1 text-[11px] font-bold tracking-wider whitespace-nowrap text-red-600 uppercase transition-colors hover:bg-red-600 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Rechazar
          </button>
        </>
      )}

      {direction === 'sent' && (
        <button
          type='button'
          onClick={() => setConfirmWithdraw(true)}
          disabled={isPending}
          className='font-pt-mono cursor-pointer rounded-sm border border-red-600 px-3 py-1 text-[11px] font-bold tracking-wider whitespace-nowrap text-red-600 uppercase transition-colors hover:bg-red-600 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
        >
          Retirar
        </button>
      )}

      <ConfirmActionModal
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title='Rechazar propuesta'
        message={`Vas a rechazar la propuesta de ${displayName}. Esta acción no se puede deshacer.`}
        confirmLabel='Rechazar'
        variant='destructive'
        isPending={isPending}
        onConfirm={handleReject}
      />

      <ConfirmActionModal
        open={confirmWithdraw}
        onOpenChange={setConfirmWithdraw}
        title='Retirar propuesta'
        message={`Vas a retirar tu propuesta a ${displayName}. La fila se elimina y podrás enviar otra más adelante.`}
        confirmLabel='Retirar'
        variant='destructive'
        isPending={isPending}
        onConfirm={handleWithdraw}
      />
    </div>
  )
}

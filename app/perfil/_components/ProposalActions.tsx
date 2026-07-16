'use client'

import { AdminButton } from '@/app/admin/_components/kit'
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
          <AdminButton
            type='button'
            variant='primary'
            size='sm'
            onClick={handleAccept}
            disabled={isPending}
            className='bg-admin-olive text-admin-surface'
          >
            Aceptar
          </AdminButton>
          <AdminButton
            type='button'
            variant='danger'
            size='sm'
            onClick={() => setConfirmReject(true)}
            disabled={isPending}
          >
            Rechazar
          </AdminButton>
        </>
      )}

      {direction === 'sent' && (
        <AdminButton
          type='button'
          variant='danger'
          size='sm'
          onClick={() => setConfirmWithdraw(true)}
          disabled={isPending}
        >
          Retirar
        </AdminButton>
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

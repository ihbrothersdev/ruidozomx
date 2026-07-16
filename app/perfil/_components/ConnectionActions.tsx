'use client'

import { AdminButton } from '@/app/admin/_components/kit'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { sileo } from 'sileo'
import { withdrawInterest } from '../actions'
import ConectarModal from './ConectarModal'
import ConfirmActionModal from './ConfirmActionModal'

interface ConnectionActionsProps {
  profileId: string
  displayName: string
  direction: 'received' | 'sent'
  isMutual: boolean
}

export default function ConnectionActions({ profileId, displayName, direction, isMutual }: ConnectionActionsProps) {
  const router = useRouter()
  const [conectarOpen, setConectarOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleWithdraw() {
    startTransition(async () => {
      const result = await withdrawInterest({ toProfileId: profileId })
      if (result.error) {
        sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
        return
      }
      setConfirmOpen(false)
      router.refresh()
    })
  }

  return (
    <div className='mt-1 flex flex-wrap gap-2'>
      {direction === 'received' && !isMutual && (
        <AdminButton
          type='button'
          variant='solid'
          size='sm'
          onClick={() => setConectarOpen(true)}
        >
          Conectar de vuelta
        </AdminButton>
      )}

      {direction === 'sent' && (
        <AdminButton
          type='button'
          variant='danger'
          size='sm'
          onClick={() => setConfirmOpen(true)}
        >
          Retirar
        </AdminButton>
      )}

      <ConectarModal
        open={conectarOpen}
        onOpenChange={setConectarOpen}
        profileId={profileId}
        profileName={displayName}
        onSuccess={() => router.refresh()}
      />

      <ConfirmActionModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='Retirar conexión'
        message={`Vas a retirar tu conexión con ${displayName}. La fila se elimina y podrás volver a conectar más adelante.`}
        confirmLabel='Retirar'
        variant='destructive'
        isPending={isPending}
        onConfirm={handleWithdraw}
      />
    </div>
  )
}

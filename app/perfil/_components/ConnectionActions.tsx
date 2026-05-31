'use client'

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
        <button
          type='button'
          onClick={() => setConectarOpen(true)}
          className='font-pt-mono cursor-pointer rounded-sm bg-black px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 active:scale-95'
        >
          Conectar de vuelta
        </button>
      )}

      {direction === 'sent' && (
        <button
          type='button'
          onClick={() => setConfirmOpen(true)}
          className='font-pt-mono cursor-pointer rounded-sm border border-red-600 px-3 py-1 text-[11px] font-bold tracking-wider text-red-600 uppercase transition-colors hover:bg-red-600 hover:text-white active:scale-95'
        >
          Retirar
        </button>
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

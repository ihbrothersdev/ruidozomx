'use client'

import { reopenProposal } from '@/app/admin/actions'
import { AdminButton } from '@/app/admin/_components/kit'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'
import { Check, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { RejectModal } from './RejectModal'
import { SlotPicker, type OccupiedSlot } from './SlotPicker'

interface ProposalActionsProps {
  proposalId: string
  proposalTitle: string
  proposalArtist: string
  status: string
  cassetteName: string | null
  occupied: OccupiedSlot[]
  listing: string
}

export function ProposalActions({
  proposalId,
  proposalTitle,
  proposalArtist,
  status,
  cassetteName,
  occupied,
  listing
}: ProposalActionsProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  if (status === 'pending') {
    const acceptBtn = (
      <AdminButton
        onClick={() => setPickerOpen(true)}
        disabled={!cassetteName}
        className='bg-admin-olive text-admin-surface'
      >
        <Check className='h-3.5 w-3.5' />
        Aceptar
      </AdminButton>
    )

    return (
      <>
        <div className='flex flex-wrap items-center gap-2'>
          {cassetteName ? (
            acceptBtn
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>{acceptBtn}</span>
                </TooltipTrigger>
                <TooltipContent className='border-2 border-admin-ink bg-admin-surface text-admin-ink'>
                  No hay cassette destino. Marca uno como &quot;siguiente&quot;.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <AdminButton
            variant='danger'
            onClick={() => setRejectOpen(true)}
          >
            <X className='h-3.5 w-3.5' />
            Rechazar
          </AdminButton>
        </div>

        {pickerOpen && cassetteName && (
          <SlotPicker
            proposalId={proposalId}
            proposalTitle={proposalTitle}
            proposalArtist={proposalArtist}
            cassetteName={cassetteName}
            occupied={occupied}
            listing={listing}
            onClose={() => setPickerOpen(false)}
          />
        )}
        {rejectOpen && (
          <RejectModal
            proposalId={proposalId}
            proposalTitle={proposalTitle}
            proposalArtist={proposalArtist}
            listing={listing}
            onClose={() => setRejectOpen(false)}
          />
        )}
      </>
    )
  }

  return (
    <form action={reopenProposal}>
      <input
        type='hidden'
        name='proposal_id'
        value={proposalId}
      />
      <input
        type='hidden'
        name='listing'
        value={listing}
      />
      <AdminButton
        type='submit'
        variant='ghost'
        size='sm'
      >
        <RotateCcw className='h-3 w-3' />
        Re-abrir
      </AdminButton>
    </form>
  )
}

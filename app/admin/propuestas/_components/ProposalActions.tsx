'use client'

import { reopenProposal } from '@/app/admin/actions'
import { Button } from '@/app/components/ui/button'
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
}

export function ProposalActions({
  proposalId,
  proposalTitle,
  proposalArtist,
  status,
  cassetteName,
  occupied
}: ProposalActionsProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  if (status === 'pending') {
    const acceptBtn = (
      <Button
        onClick={() => setPickerOpen(true)}
        disabled={!cassetteName}
        className='font-pt-mono bg-green-600 text-xs font-bold tracking-wide text-white uppercase hover:bg-green-500 disabled:bg-white/5 disabled:text-white/30'
      >
        <Check className='h-3.5 w-3.5' />
        Aceptar
      </Button>
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
                <TooltipContent>No hay cassette destino. Marca uno como &quot;siguiente&quot;.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant='outline'
            onClick={() => setRejectOpen(true)}
            className='font-pt-mono border-red-500/30 bg-transparent text-xs font-bold tracking-wide text-red-300 uppercase hover:bg-red-500/10 hover:text-red-200'
          >
            <X className='h-3.5 w-3.5' />
            Rechazar
          </Button>
        </div>

        {pickerOpen && cassetteName && (
          <SlotPicker
            proposalId={proposalId}
            proposalTitle={proposalTitle}
            proposalArtist={proposalArtist}
            cassetteName={cassetteName}
            occupied={occupied}
            onClose={() => setPickerOpen(false)}
          />
        )}
        {rejectOpen && (
          <RejectModal
            proposalId={proposalId}
            proposalTitle={proposalTitle}
            proposalArtist={proposalArtist}
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
      <Button
        type='submit'
        variant='outline'
        size='sm'
        className='font-pt-mono border-white/10 bg-transparent text-[11px] tracking-wider text-white/50 uppercase hover:bg-white/5 hover:text-white'
      >
        <RotateCcw className='h-3 w-3' />
        Re-abrir
      </Button>
    </form>
  )
}

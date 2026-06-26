'use client'

import { rejectProposal } from '@/app/admin/actions'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { Button } from '@/app/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/app/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface RejectModalProps {
  proposalId: string
  proposalTitle: string
  proposalArtist: string
  wasSelected?: boolean
  listing: string
  onClose: () => void
}

export function RejectModal({
  proposalId,
  proposalTitle,
  proposalArtist,
  wasSelected,
  listing,
  onClose
}: RejectModalProps) {
  const [submitting, setSubmitting] = useState(false)

  return (
    <Dialog
      open
      onOpenChange={open => !open && onClose()}
    >
      <DialogContent className='border-red-500/20 bg-neutral-900 text-white sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-start gap-4'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400'>
              <AlertTriangle className='h-5 w-5' />
            </div>
            <div className='min-w-0 flex-1 text-left'>
              <DialogTitle className='font-baby-doll text-xl tracking-wider text-white uppercase'>
                Rechazar propuesta
              </DialogTitle>
              <DialogDescription className='font-pt-mono mt-1 text-xs text-white/50'>
                <span className='font-bold text-white/80'>{proposalArtist}</span> — {proposalTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {wasSelected && (
          <Alert className='border-amber-500/20 bg-amber-500/10 text-amber-300'>
            <AlertDescription className='font-pt-mono text-[11px] text-amber-300'>
              Esta propuesta ya estaba en un cassette. Al rechazarla también será removida del cassette.
            </AlertDescription>
          </Alert>
        )}

        <form
          action={rejectProposal}
          onSubmit={() => setSubmitting(true)}
        >
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
          <DialogFooter className='mt-2 gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={onClose}
              className='font-pt-mono text-xs tracking-wider text-white/60 uppercase hover:bg-white/5 hover:text-white'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={submitting}
              className='font-pt-mono bg-red-600 text-xs tracking-wider text-white uppercase hover:bg-red-500'
            >
              {submitting ? 'Rechazando…' : 'Sí, rechazar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

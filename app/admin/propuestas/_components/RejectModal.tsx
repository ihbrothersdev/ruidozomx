'use client'

import { rejectProposal } from '@/app/admin/actions'
import { AdminButton, Notice } from '@/app/admin/_components/kit'
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
      <DialogContent className='border-2 border-admin-ink bg-admin-surface text-admin-ink admin-hard sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-start gap-4'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-admin-ink bg-admin-red/12 text-admin-red'>
              <AlertTriangle className='h-5 w-5' />
            </div>
            <div className='min-w-0 flex-1 text-left'>
              <DialogTitle className='font-baby-doll text-xl tracking-wider text-admin-ink uppercase'>
                Rechazar propuesta
              </DialogTitle>
              <DialogDescription className='font-pt-mono mt-1 text-xs text-admin-ink-soft'>
                <span className='font-bold text-admin-ink'>{proposalArtist}</span> — {proposalTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {wasSelected && (
          <Notice
            tone='gold'
            icon={AlertTriangle}
          >
            Esta propuesta ya estaba en un cassette. Al rechazarla también será removida del cassette.
          </Notice>
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
            <AdminButton
              type='button'
              variant='ghost'
              onClick={onClose}
            >
              Cancelar
            </AdminButton>
            <AdminButton
              type='submit'
              variant='primary'
              disabled={submitting}
            >
              {submitting ? 'Rechazando…' : 'Sí, rechazar'}
            </AdminButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

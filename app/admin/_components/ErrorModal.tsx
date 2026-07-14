'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/app/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { AdminButton, LabelTag } from '@/app/admin/_components/kit'

export type AdminError = {
  title?: string
  message: string
  /** Raw technical detail (error message, code) the admin can screenshot/report. */
  detail?: string
}

/**
 * Prominent error dialog for admin flows. Unlike a toast, it stays until
 * dismissed and surfaces the underlying detail — so an unexpected failure in
 * production is visible and reportable instead of silently swallowing the UI.
 */
export function ErrorModal({ error, onClose }: { error: AdminError | null; onClose: () => void }) {
  return (
    <Dialog
      open={!!error}
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      <DialogContent className='admin-hard border-2 border-admin-ink bg-admin-surface text-admin-ink sm:max-w-md'>
        <DialogHeader className='text-left'>
          <div className='mb-1 flex items-center gap-2 text-admin-red'>
            <AlertTriangle className='h-5 w-5' />
            <LabelTag tone='red'>Error</LabelTag>
          </div>
          <DialogTitle className='font-baby-doll text-2xl tracking-wider text-admin-ink uppercase'>
            {error?.title ?? 'Algo salió mal'}
          </DialogTitle>
          <DialogDescription className='font-pt-mono text-sm text-admin-ink-soft'>{error?.message}</DialogDescription>
        </DialogHeader>

        {error?.detail && (
          <pre className='max-h-40 overflow-auto border-2 border-admin-ink bg-admin-paper-deep p-3 font-pt-mono text-[11px] leading-relaxed whitespace-pre-wrap text-admin-ink-soft'>
            {error.detail}
          </pre>
        )}

        <DialogFooter>
          <AdminButton
            type='button'
            variant='primary'
            onClick={onClose}
          >
            Entendido
          </AdminButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

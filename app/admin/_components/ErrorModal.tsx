'use client'

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
      <DialogContent className='border-red-500/30 bg-neutral-900 text-white sm:max-w-md'>
        <DialogHeader className='text-left'>
          <div className='mb-1 flex items-center gap-2 text-red-400'>
            <AlertTriangle className='h-5 w-5' />
            <p className='font-pt-mono text-[10px] font-bold tracking-[0.25em] uppercase'>Error</p>
          </div>
          <DialogTitle className='font-baby-doll text-2xl tracking-wider text-white uppercase'>
            {error?.title ?? 'Algo salió mal'}
          </DialogTitle>
          <DialogDescription className='font-pt-mono text-sm text-white/70'>{error?.message}</DialogDescription>
        </DialogHeader>

        {error?.detail && (
          <pre className='max-h-40 overflow-auto rounded-md border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-white/50'>
            {error.detail}
          </pre>
        )}

        <DialogFooter>
          <Button
            type='button'
            onClick={onClose}
            className='font-pt-mono bg-red-600 text-xs tracking-wider text-white uppercase hover:bg-red-500'
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

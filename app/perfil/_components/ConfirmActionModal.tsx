'use client'

import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { AdminButton } from '@/app/admin/_components/kit'

interface ConfirmActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Body copy. Plain text — formatting/emphasis lives in the parent. */
  message: string
  /** Label for the confirm button (e.g. "Eliminar", "Confirmar cuenta"). */
  confirmLabel: string
  /** "destructive" paints the confirm button red; "default" paints it ink. */
  variant?: 'destructive' | 'default'
  isPending?: boolean
  onConfirm: () => void
}

export default function ConfirmActionModal({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  variant = 'default',
  isPending = false,
  onConfirm
}: ConfirmActionModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={isPending ? undefined : onOpenChange}
    >
      <DialogContent
        className='admin-hard border-2 border-admin-ink bg-admin-surface p-0 text-admin-ink sm:max-w-md'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>{title}</DialogTitle>

        <div className='px-6 py-6 sm:px-8 sm:py-7'>
          <h3 className='font-baby-doll text-3xl text-admin-ink'>{title}</h3>

          <p className='font-pt-mono mt-3 text-sm leading-relaxed tracking-wider text-admin-ink-soft'>{message}</p>

          <div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3'>
            <AdminButton
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </AdminButton>
            <AdminButton
              type='button'
              variant={variant === 'destructive' ? 'primary' : 'solid'}
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? 'Procesando…' : confirmLabel}
            </AdminButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

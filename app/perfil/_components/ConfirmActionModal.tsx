'use client'

import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'

interface ConfirmActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Body copy. Plain text — formatting/emphasis lives in the parent. */
  message: string
  /** Label for the confirm button (e.g. "Eliminar", "Confirmar cuenta"). */
  confirmLabel: string
  /** "destructive" paints the confirm button red; "default" paints it black. */
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
  const confirmCls =
    variant === 'destructive'
      ? 'font-impact-label cursor-pointer border-red-800 bg-red-700 px-5 py-1.5 text-lg font-bold tracking-wider text-white uppercase transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60'
      : 'font-impact-label cursor-pointer border-black bg-black px-5 py-1.5 text-lg font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <Dialog
      open={open}
      onOpenChange={isPending ? undefined : onOpenChange}
    >
      <DialogContent
        className='border-2 border-black bg-white p-0 shadow-[6px_6px_0_0_rgba(0,0,0,1)] sm:max-w-md'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>{title}</DialogTitle>

        <div className='px-6 py-6 sm:px-8 sm:py-7'>
          <h3 className='font-impact-label text-2xl font-bold tracking-wider text-black uppercase'>{title}</h3>

          <p className='font-pt-mono mt-3 text-sm leading-relaxed tracking-wider text-black/80'>{message}</p>

          <div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3'>
            <button
              type='button'
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className='font-impact-label cursor-pointer border-2 border-black bg-white px-5 py-1.5 text-lg font-bold tracking-wider text-black uppercase transition-colors hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-60'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={onConfirm}
              disabled={isPending}
              className={confirmCls}
            >
              {isPending ? 'Procesando…' : confirmLabel}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

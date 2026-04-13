'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/app/components/ui/dialog'
import { useState, useTransition } from 'react'
import { sileo } from 'sileo'
import { resetPassword } from '../actions'

const inputCls =
  'font-pt-mono w-full border-2 border-red-600 bg-transparent px-4 py-3 text-sm text-black placeholder:text-red-600/50 placeholder:uppercase placeholder:tracking-wider placeholder:font-bold focus:border-red-700 focus:outline-none'

export function ForgotPasswordModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) {
        sileo.error({
          title: 'Error',
          description: result.error,
          position: 'top-center',
          duration: 5000
        })
      } else {
        sileo.success({
          title: '¡Listo!',
          description: 'Te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.',
          position: 'top-center',
          duration: 6000
        })
        setOpen(false)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <button
          type='button'
          className='underline underline-offset-4 hover:opacity-80'
          style={{ color: '#C7352E' }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </DialogTrigger>

      <DialogContent className='bg-[#f5f0eb] sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='font-baby-doll text-3xl font-black text-black uppercase'>
            Recuperar contraseña
          </DialogTitle>
          <DialogDescription className='font-pt-mono text-xs font-bold tracking-wider text-black/60'>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </DialogDescription>
        </DialogHeader>

        <form
          action={handleSubmit}
          className='space-y-4'
        >
          <input
            name='email'
            type='email'
            required
            placeholder='EMAIL'
            className={inputCls}
            disabled={isPending}
          />

          <button
            type='submit'
            disabled={isPending}
            className='font-baby-doll w-full cursor-pointer rounded bg-[#C7352E] py-3 text-lg font-bold tracking-wider text-white uppercase transition-all hover:bg-[#a82c26] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isPending ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

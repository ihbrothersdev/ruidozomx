'use client'

import { updatePassword } from '@/app/(auth)/actions'
import { PasswordInput } from '@/app/components/ui/password-input'
import { useState, useTransition } from 'react'
import { sileo } from 'sileo'

const passwordWrapperCls =
  'font-pt-mono w-full border-2 border-red-600 bg-transparent px-4 py-3 text-sm text-black focus-within:border-red-700'

const passwordInputCls =
  'placeholder:text-red-600/50 placeholder:uppercase placeholder:tracking-wider placeholder:font-bold'

const passwordToggleCls =
  'shrink-0 text-red-600/70 transition-colors hover:text-red-700 focus:outline-none disabled:opacity-50'

export function NewPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(formData: FormData) {
    setError('')
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) {
        sileo.error({
          title: 'Error',
          description: result.error,
          position: 'top-center',
          duration: 5000
        })
      }
      // On success, the server action redirects to /perfil
    })
  }

  return (
    <form
      action={handleSubmit}
      className='relative z-10 space-y-4 px-8 py-8 sm:px-12 sm:py-10'
    >
      <PasswordInput
        name='password'
        required
        minLength={6}
        placeholder='NUEVA CONTRASEÑA'
        className={passwordWrapperCls}
        inputClassName={passwordInputCls}
        toggleClassName={passwordToggleCls}
        disabled={isPending}
      />

      <PasswordInput
        name='confirm'
        required
        minLength={6}
        placeholder='CONFIRMAR CONTRASEÑA'
        className={passwordWrapperCls}
        inputClassName={passwordInputCls}
        toggleClassName={passwordToggleCls}
        disabled={isPending}
      />

      {error && <p className='font-pt-mono text-xs font-bold text-red-600'>{error}</p>}

      <div className='flex justify-center pt-2'>
        <button
          type='submit'
          disabled={isPending}
          className='font-baby-doll w-full cursor-pointer rounded bg-[#C7352E] py-3 text-lg font-bold tracking-wider text-white uppercase transition-all hover:bg-[#a82c26] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isPending ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </div>
    </form>
  )
}

'use client'

import { PasswordInput } from '@/app/components/ui/password-input'
import Image from 'next/image'
import { useActionState, useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { login, type LoginState } from '../actions'

const inputCls =
  'font-pt-mono w-full border-2 border-red-600 bg-transparent px-4 py-3 text-sm text-black placeholder:text-red-600/50 placeholder:uppercase placeholder:tracking-wider placeholder:font-bold focus:border-red-700 focus:outline-none'

const passwordWrapperCls =
  'font-pt-mono w-full border-2 border-red-600 bg-transparent px-4 py-3 text-sm text-black focus-within:border-red-700'

const passwordInputCls =
  'placeholder:text-red-600/50 placeholder:uppercase placeholder:tracking-wider placeholder:font-bold'

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, undefined)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (state?.error) {
      sileo.error({
        title: 'Error',
        description: state.error,
        position: 'top-center',
        duration: 5000
      })
    }
  }, [state])

  return (
    <form
      action={formAction}
      className='relative z-10 space-y-4 px-8 py-8 sm:px-12 sm:py-10'
    >
      <input
        id='email'
        name='email'
        type='email'
        required
        placeholder='EMAIL'
        className={inputCls}
        disabled={pending}
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <PasswordInput
        id='password'
        name='password'
        required
        minLength={6}
        placeholder='CONTRASEÑA'
        className={passwordWrapperCls}
        inputClassName={passwordInputCls}
        toggleClassName='shrink-0 text-red-600/70 transition-colors hover:text-red-700 focus:outline-none disabled:opacity-50'
        disabled={pending}
      />

      <div className='flex justify-center pt-2'>
        <button
          type='submit'
          disabled={pending}
          className='cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-60'
        >
          <Image
            src='/assets/iniciar-sesion/boton-entrar.png'
            alt='Entrar'
            width={240}
            height={70}
            className='w-32 sm:w-36'
            style={{ height: 'auto' }}
          />
        </button>
      </div>
    </form>
  )
}

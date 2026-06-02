'use client'

import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react'

type PasswordInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'className'> & {
  className?: string
  inputClassName?: string
  toggleClassName?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, inputClassName, toggleClassName, disabled, ...props },
  ref
) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={`min-w-0 flex-1 border-0 bg-transparent p-0 outline-none focus:outline-none ${inputClassName ?? ''}`}
        {...props}
      />
      <button
        type='button'
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setVisible(v => !v)}
        disabled={disabled}
        className={
          toggleClassName ??
          'shrink-0 opacity-60 transition-opacity hover:opacity-100 focus:outline-none disabled:opacity-50'
        }
      >
        {visible ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
      </button>
    </div>
  )
})

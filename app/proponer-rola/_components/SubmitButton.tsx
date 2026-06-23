'use client'

import Image from 'next/image'

export function SubmitButton({
  disabled,
  limitReached,
  pending
}: {
  disabled: boolean
  limitReached: boolean
  pending: boolean
}) {
  const isDisabled = disabled || pending

  return (
    <button
      type='submit'
      disabled={isDisabled}
      className='relative cursor-pointer disabled:cursor-not-allowed'
    >
      <Image
        src={
          limitReached
            ? '/assets/registro/proponer-rola/boton-proponer-rola-hover.png'
            : '/assets/registro/proponer-rola/boton-proponer-rola.png'
        }
        alt='Proponer rola'
        width={200}
        height={100}
        className={`w-28 transition-opacity sm:w-36 ${isDisabled ? 'opacity-50' : 'hover:opacity-90'}`}
        style={{ height: 'auto' }}
      />
      {pending && (
        <span className='font-pt-mono absolute inset-0 flex items-center justify-center text-xs font-bold tracking-wider text-black uppercase'>
          Enviando…
        </span>
      )}
    </button>
  )
}

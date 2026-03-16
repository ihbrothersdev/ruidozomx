'use client'

import { Label } from '@/app/components/ui/label'
import { useState } from 'react'
import { labelCls } from './form-styles'

export interface YesNoFieldProps {
  label: string
  name: string
  required?: boolean
}

export function YesNoField({ label, name, required }: YesNoFieldProps) {
  const [value, setValue] = useState<string | null>(null)

  return (
    <div className='space-y-0.5'>
      <Label className={labelCls}>
        {label}
        {required && <span className='text-red-600'>*</span>}
      </Label>
      {/* Hidden input to submit the value */}
      {value !== null && (
        <input
          type='hidden'
          name={name}
          value={value}
        />
      )}
      {required && value === null && (
        <input
          type='hidden'
          name={`_${name}_required`}
          required
          value=''
        />
      )}
      <div className='flex items-center gap-4'>
        <button
          type='button'
          onClick={() => setValue('true')}
          className='flex items-center gap-1.5'
        >
          <span
            className={`inline-flex h-4 w-4 items-center justify-center border-2 border-red-600 ${
              value === 'true' ? 'bg-red-600' : 'bg-transparent'
            }`}
          >
            {value === 'true' && (
              <svg
                viewBox='0 0 12 12'
                className='h-3 w-3 text-white'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M2 6l3 3 5-5' />
              </svg>
            )}
          </span>
          <span className='font-pt-mono text-sm font-bold text-black uppercase'>SI</span>
        </button>
        <button
          type='button'
          onClick={() => setValue('false')}
          className='flex items-center gap-1.5'
        >
          <span
            className={`inline-flex h-4 w-4 items-center justify-center border-2 border-red-600 ${
              value === 'false' ? 'bg-red-600' : 'bg-transparent'
            }`}
          >
            {value === 'false' && (
              <svg
                viewBox='0 0 12 12'
                className='h-3 w-3 text-white'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M2 6l3 3 5-5' />
              </svg>
            )}
          </span>
          <span className='font-pt-mono text-sm font-bold text-black uppercase'>NO</span>
        </button>
      </div>
    </div>
  )
}

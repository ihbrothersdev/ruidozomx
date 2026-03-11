'use client'

import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { inputCls, labelCls } from './form-styles'

export interface FieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  textarea?: boolean
  maxLength?: number
  rows?: number
}

export function Field({ label, name, type = 'text', required, placeholder, textarea, maxLength, rows }: FieldProps) {
  return (
    <div className='min-w-0 space-y-0.5'>
      <Label
        htmlFor={name}
        className={labelCls}
      >
        {label}
        {required && <span className='text-red-600'>*</span>}
      </Label>
      {textarea ? (
        <Textarea
          id={name}
          name={name}
          required={required}
          placeholder={placeholder}
          rows={rows ?? 4}
          maxLength={maxLength}
          className={inputCls + ' resize-none'}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className={inputCls}
        />
      )}
    </div>
  )
}

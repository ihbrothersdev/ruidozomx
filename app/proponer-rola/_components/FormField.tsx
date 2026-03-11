'use client'

import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { inputCls, labelCls } from '../constants'

export interface FormFieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  textarea?: boolean
}

export function FormField({ label, name, type = 'text', required, placeholder, textarea }: FormFieldProps) {
  return (
    <div className='space-y-1'>
      <Label
        htmlFor={name}
        className={labelCls}
      >
        {label} {required && <span className='text-red-600'>*</span>}
      </Label>
      {textarea ? (
        <Textarea
          id={name}
          name={name}
          required={required}
          placeholder={placeholder}
          rows={3}
          className={inputCls + ' resize-none'}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
    </div>
  )
}

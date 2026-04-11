'use client'

import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { labelCls, selectTriggerCls } from './form-styles'

export interface CascadingSelectProps {
  label: string
  name: string
  required?: boolean
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  getLabel?: (value: string) => React.ReactNode
}

export function CascadingSelect({
  label,
  name,
  required,
  options,
  value,
  onChange,
  placeholder,
  getLabel,
}: CascadingSelectProps) {
  return (
    <div className='min-w-0 space-y-0.5'>
      <Label
        htmlFor={name}
        className={labelCls}
      >
        {label}
        {required && <span className='text-red-600'>*</span>}
      </Label>
      <Select
        name={name}
        required={required}
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger className={selectTriggerCls}>
          <SelectValue placeholder={placeholder ?? 'Selecciona...'} />
        </SelectTrigger>
        <SelectContent
          className='overflow-y-auto'
          style={{ maxHeight: '192px' }}
        >
          {options.map(opt => (
            <SelectItem
              key={opt}
              value={opt}
            >
              {getLabel ? getLabel(opt) : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

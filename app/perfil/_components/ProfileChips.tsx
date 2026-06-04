'use client'

import type { Role } from '@/lib/types'
import EditableChip from './EditableChip'
import EditableMultiSelect from './EditableMultiSelect'
import { ROLE_EDITABLE_FIELDS } from './profile-constants'

interface ProfileChipsProps {
  role: Role
  roleProfile: Record<string, unknown>
  editing?: boolean
  onFieldChange?: (key: string, value: unknown) => void
}

export default function ProfileChips({ role, roleProfile, editing = false, onFieldChange }: ProfileChipsProps) {
  if (editing) {
    return (
      <EditableChipsGroup
        role={role}
        state={roleProfile}
        onChange={onFieldChange ?? (() => {})}
      />
    )
  }

  const fields = ROLE_EDITABLE_FIELDS[role]
  if (!fields || fields.length === 0) return null

  const chips: string[] = []

  for (const field of fields) {
    const value = roleProfile[field.key]

    if (field.type === 'boolean' && value === true) {
      chips.push(field.label)
    } else if (field.type === 'array' && Array.isArray(value)) {
      for (const item of value) {
        chips.push(String(item))
      }
    } else if (field.type === 'choice' && typeof value === 'string' && value.trim()) {
      chips.push(`${field.label}: ${value}`)
    }
  }

  if (chips.length === 0) return null

  return (
    <div className='flex flex-wrap gap-2'>
      {chips.map((chip, i) => (
        <span
          key={`${chip}-${i}`}
          className='font-pt-mono rounded-sm bg-red-600 px-3 py-1.5 text-[11px] font-bold tracking-wider text-white uppercase'
        >
          {chip}
        </span>
      ))}
    </div>
  )
}

interface EditableChipsGroupProps {
  role: Role
  state: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

function EditableChipsGroup({ role, state, onChange }: EditableChipsGroupProps) {
  const fields = ROLE_EDITABLE_FIELDS[role]
  if (!fields || fields.length === 0) {
    return (
      <p className='font-pt-mono text-xs tracking-wider text-black/40 uppercase italic'>
        Sin opciones configurables para este rol.
      </p>
    )
  }

  // Render booleans together as wrapping chips, then arrays/choices as their
  // own labeled rows underneath for clarity.
  const booleans = fields.filter(f => f.type === 'boolean')
  const arrays = fields.filter(f => f.type === 'array')
  const choices = fields.filter(f => f.type === 'choice')

  return (
    <div className='space-y-3'>
      <p className='font-pt-mono text-[10px] tracking-wider text-black/40 uppercase'>Toca para activar o desactivar</p>
      {booleans.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {booleans.map(field => (
            <EditableChip
              key={field.key}
              label={field.label}
              value={Boolean(state[field.key])}
              onChange={next => onChange(field.key, next)}
            />
          ))}
        </div>
      )}

      {choices.map(field => {
        if (field.type !== 'choice') return null
        const current = typeof state[field.key] === 'string' ? (state[field.key] as string) : ''
        return (
          <div key={field.key}>
            <p className='font-pt-mono mb-1 text-[11px] font-bold tracking-wider text-black/60 uppercase'>
              {field.label}
            </p>
            <div className='flex flex-wrap gap-2'>
              {field.options.map(option => {
                const isOn = current === option
                return (
                  <button
                    key={option}
                    type='button'
                    onClick={() => onChange(field.key, isOn ? '' : option)}
                    aria-pressed={isOn}
                    className={
                      'font-pt-mono cursor-pointer rounded-sm px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors ' +
                      (isOn
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-black/10 text-black/40 hover:bg-black/20 hover:text-black/60')
                    }
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {arrays.map(field => {
        if (field.type !== 'array') return null
        const current = Array.isArray(state[field.key]) ? (state[field.key] as string[]) : []
        return (
          <div key={field.key}>
            <p className='font-pt-mono mb-1 text-[11px] font-bold tracking-wider text-black/60 uppercase'>
              {field.label}
            </p>
            <EditableMultiSelect
              name={field.key}
              options={field.options}
              value={current}
              onChange={next => onChange(field.key, next)}
            />
          </div>
        )
      })}
    </div>
  )
}

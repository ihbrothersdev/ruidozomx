'use client'

import { Label } from '@/app/components/ui/label'
import { COUNTRIES, COUNTRY_FLAGS, getCities, getStates } from '@/lib/mexico-locations'
import { useEffect, useState } from 'react'
import { CascadingSelect } from './CascadingSelect'
import { compactInputCls, compactLabelCls, inputCls, labelCls } from './form-styles'

interface LocationFieldsProps {
  /** Optional initial values — defaults to ('México', '', ''). */
  initialCountry?: string
  initialState?: string
  initialCity?: string
  /** When provided, the parent owns the values and is notified of every change. */
  onChange?: (next: { country: string; state: string; city: string }) => void
  /** Whether the underlying selects/inputs should be marked required for form submission. */
  required?: boolean
  /** Use smaller padding + font + neutral labels (for inline editing). */
  compact?: boolean
}

export function LocationFields({
  initialCountry = 'México',
  initialState = '',
  initialCity = '',
  onChange,
  required = true,
  compact = false
}: LocationFieldsProps = {}) {
  const activeInputCls = compact ? compactInputCls : inputCls
  const activeLabelCls = compact ? compactLabelCls : labelCls
  const [country, setCountry] = useState(initialCountry)
  const [state, setState] = useState(initialState)
  const [city, setCity] = useState(initialCity)

  useEffect(() => {
    onChange?.({ country, state, city })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, state, city])

  const isOther = country === 'Otro'
  const states = getStates(country)
  const cities = getCities(country, state)

  return (
    <>
      <CascadingSelect
        label='País'
        name='country'
        required={required}
        options={[...COUNTRIES]}
        value={country}
        onChange={v => {
          setCountry(v)
          setState('')
          setCity('')
        }}
        placeholder='Selecciona un país'
        getLabel={v => (
          <span className='flex items-center gap-2'>
            <span>{COUNTRY_FLAGS[v] ?? ''}</span>
            <span>{v}</span>
          </span>
        )}
        compact={compact}
      />

      {isOther ? (
        <>
          <div className='min-w-0 space-y-0.5'>
            <Label
              htmlFor='state'
              className={activeLabelCls}
            >
              Estado/Provincia{required && <span className='ml-2 text-red-600'>*</span>}
            </Label>
            <input
              id='state'
              name='state'
              required={required}
              placeholder='Escribe tu estado o provincia'
              className={activeInputCls + ' w-full'}
              value={state}
              onChange={e => setState(e.target.value)}
            />
          </div>
          <div className='min-w-0 space-y-0.5'>
            <Label
              htmlFor='city'
              className={activeLabelCls}
            >
              Ciudad{required && <span className='ml-2 text-red-600'>*</span>}
            </Label>
            <input
              id='city'
              name='city'
              required={required}
              placeholder='Escribe tu ciudad'
              className={activeInputCls + ' w-full'}
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </div>
        </>
      ) : (
        <>
          <CascadingSelect
            label='Estado/Provincia'
            name='state'
            required={required}
            options={states}
            value={state}
            onChange={v => {
              setState(v)
              setCity('')
            }}
            placeholder='Dependiente del país (Drop down)'
            compact={compact}
          />
          <CascadingSelect
            label='Ciudad'
            name='city'
            required={required}
            options={cities}
            value={city}
            onChange={setCity}
            placeholder='Dependiente del estado (Drop down)'
            compact={compact}
          />
        </>
      )}
    </>
  )
}

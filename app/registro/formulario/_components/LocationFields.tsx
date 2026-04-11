'use client'

import { Label } from '@/app/components/ui/label'
import { COUNTRIES, COUNTRY_FLAGS, getCities, getStates } from '@/lib/mexico-locations'
import { useState } from 'react'
import { CascadingSelect } from './CascadingSelect'
import { inputCls, labelCls } from './form-styles'

export function LocationFields() {
  const [country, setCountry] = useState('México')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')

  const isOther = country === 'Otro'
  const states = getStates(country)
  const cities = getCities(country, state)

  return (
    <>
      <CascadingSelect
        label='País'
        name='country'
        required
        options={[...COUNTRIES]}
        value={country}
        onChange={v => {
          setCountry(v)
          setState('')
          setCity('')
        }}
        placeholder='Selecciona un país'
        getLabel={v => `${COUNTRY_FLAGS[v] ?? ''} ${v}`}
      />

      {isOther ? (
        <>
          <div className='min-w-0 space-y-0.5'>
            <Label
              htmlFor='state'
              className={labelCls}
            >
              Estado/Provincia<span className='text-red-600'>*</span>
            </Label>
            <input
              id='state'
              name='state'
              required
              placeholder='Escribe tu estado o provincia'
              className={inputCls + ' w-full'}
              value={state}
              onChange={e => setState(e.target.value)}
            />
          </div>
          <div className='min-w-0 space-y-0.5'>
            <Label
              htmlFor='city'
              className={labelCls}
            >
              Ciudad<span className='text-red-600'>*</span>
            </Label>
            <input
              id='city'
              name='city'
              required
              placeholder='Escribe tu ciudad'
              className={inputCls + ' w-full'}
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
            required
            options={states}
            value={state}
            onChange={v => {
              setState(v)
              setCity('')
            }}
            placeholder='Dependiente del país (Drop down)'
          />
          <CascadingSelect
            label='Ciudad'
            name='city'
            required
            options={cities}
            value={city}
            onChange={setCity}
            placeholder='Dependiente del estado (Drop down)'
          />
        </>
      )}
    </>
  )
}

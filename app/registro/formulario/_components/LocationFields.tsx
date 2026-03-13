'use client'

import { COUNTRIES, getCities, getStates } from '@/lib/mexico-locations'
import { useState } from 'react'
import { CascadingSelect } from './CascadingSelect'

export function LocationFields() {
  const [country, setCountry] = useState('México')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')

  const states = getStates(country)
  const cities = getCities(state)

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
        placeholder='Drop down (México preseleccionado)'
      />
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
  )
}

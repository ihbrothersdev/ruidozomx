'use client'

import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { ROLE_FILTER_LABELS, type RoleFilter } from '../types'

interface FilterBarProps {
  activeFilter: RoleFilter | null
  onFilterChange: (filter: RoleFilter | null) => void
  countries: { country: string; flag: string }[]
  activeCountry: string | null
  onCountryChange: (country: string | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  /** Rendered to the right of the search bar (wraps below it on narrow screens). */
  trailing?: React.ReactNode
}

const FILTERS: RoleFilter[] = ['banda', 'venue', 'promotor', 'manager', 'agente', 'proveedor', 'fan']

const FILTER_IMAGE: Record<RoleFilter, string> = {
  banda: '/assets/community/bandas.png',
  venue: '/assets/community/venues.png',
  promotor: '/assets/community/promotores.png',
  manager: '/assets/community/managers.png',
  agente: '/assets/community/agentes.png',
  proveedor: '/assets/community/proveedores.png',
  fan: '/assets/community/fans.png'
}

export function FilterBar({
  activeFilter,
  onFilterChange,
  countries,
  activeCountry,
  onCountryChange,
  searchQuery,
  onSearchChange,
  trailing
}: FilterBarProps) {
  const activeFlag = countries.find(c => c.country === activeCountry)?.flag ?? '🌎'

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-center gap-2 md:gap-3'>
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter
          const label = ROLE_FILTER_LABELS[filter]

          return (
            <button
              key={filter}
              type='button'
              onClick={() => onFilterChange(isActive ? null : filter)}
              aria-label={label}
              aria-pressed={isActive}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
                isActive ? 'scale-105 opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={FILTER_IMAGE[filter]}
                alt={label}
                width={200}
                height={80}
                className='h-7 w-auto sm:h-9 md:h-12'
              />
            </button>
          )
        })}
      </div>

      <div className='flex flex-wrap items-center justify-center gap-x-5 gap-y-4'>
        <div className='relative max-w-lg min-w-0 flex-1 basis-80'>
          <Image
            src='/assets/community/buscador-long.png'
            alt=''
            width={600}
            height={100}
            className='h-auto w-full'
          />
          <input
            type='text'
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder='Nombre, ciudad, género, rol...'
            className='font-pt-mono absolute inset-0 w-full bg-transparent pr-4 pl-12 text-xs text-black placeholder:text-black/40 focus:outline-none sm:pl-16 sm:text-sm md:pl-18 md:text-lg'
          />
        </div>
        {countries.length > 1 && (
          // The native select is invisible and stretched over a flag-only face: closed it shows just the
          // flag, opened it lists every country by name (and keeps the OS picker on mobile).
          <label
            className={`relative flex h-11 w-16 shrink-0 cursor-pointer items-center justify-center gap-1 rounded border bg-black/40 transition-colors focus-within:border-[#ff0048] ${
              activeCountry ? 'border-[#ff0048]' : 'border-white/15 hover:border-white/40'
            }`}
            title={activeCountry ?? 'Filtrar por país'}
          >
            <span className='sr-only'>Filtrar por país</span>
            <span
              aria-hidden
              className='text-xl leading-none'
            >
              {activeFlag}
            </span>
            <ChevronDown
              aria-hidden
              className='h-3.5 w-3.5 text-white/50'
            />
            <select
              value={activeCountry ?? ''}
              onChange={e => onCountryChange(e.target.value || null)}
              className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
            >
              <option value=''>Todos los países</option>
              {countries.map(({ country }) => (
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              ))}
            </select>
          </label>
        )}
        {trailing}
      </div>
    </div>
  )
}

'use client'

import Image from 'next/image'
import { ROLE_FILTER_LABELS, type RoleFilter } from '../types'

interface FilterBarProps {
  activeFilter: RoleFilter | null
  onFilterChange: (filter: RoleFilter | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
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

export function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange }: FilterBarProps) {
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

      <div className='mx-auto flex w-full max-w-lg items-center'>
        <div className='relative flex-1'>
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
      </div>
    </div>
  )
}

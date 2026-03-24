'use client'

import { ROLE_FILTER_LABELS, type RoleFilter } from '../types'

interface FilterBarProps {
  activeFilter: RoleFilter
  onFilterChange: (filter: RoleFilter) => void
}

const FILTERS: RoleFilter[] = ['todos', 'banda', 'venue', 'promotor', 'manager', 'agente', 'proveedor', 'fan']

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap justify-center gap-2'>
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`font-baby-doll cursor-pointer border-2 px-4 py-1.5 text-sm font-bold tracking-wider uppercase transition-all md:px-5 md:text-base ${
              activeFilter === filter
                ? 'border-white bg-white text-black'
                : 'border-white/40 bg-transparent text-white/80 hover:border-white/70 hover:text-white'
            }`}
          >
            {ROLE_FILTER_LABELS[filter]}
          </button>
        ))}
      </div>

      {/* TODO: Search bar — descomentar cuando se implemente búsqueda */}
      {/* <div className='mx-auto flex w-full max-w-lg items-center gap-2'>
        <div className='relative flex-1'>
          <span className='absolute top-1/2 left-3 -translate-y-1/2 text-lg text-black/60'>🔍</span>
          <input
            type='text'
            placeholder='Buscar por nombre, ciudad, género, rol...'
            className='font-pt-mono w-full border-2 border-black/20 bg-[#f5f0e0] py-2 pr-4 pl-10 text-sm text-black placeholder:text-black/40 focus:border-black/40 focus:outline-none'
          />
        </div>
      </div> */}
    </div>
  )
}

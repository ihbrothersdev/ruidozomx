'use client'

import Image from 'next/image'
import { ROLE_FILTER_LABELS, type RoleFilter } from '../types'

interface FilterBarProps {
  activeFilter: RoleFilter
  onFilterChange: (filter: RoleFilter) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const FILTERS: RoleFilter[] = ['todos', 'banda', 'venue', 'promotor', 'manager', 'agente', 'proveedor', 'fan']

export function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange }: FilterBarProps) {
  return (
    <div className='flex flex-col gap-4'>
      {/* <div className='flex flex-wrap justify-center gap-2'>
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
      </div> */}

      <div className='mx-auto flex w-full max-w-lg items-center'>
        <div className='relative flex-1'>
          <Image
            src='/assets/header/buscador.png'
            alt=''
            width={600}
            height={100}
            className='h-auto w-full'
            unoptimized
          />
          <input
            type='text'
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder='Nombre, ciudad, género, rol...'
            className='font-pt-mono absolute inset-0 w-full bg-transparent pr-6 pl-18 text-lg text-black placeholder:text-black/40 focus:outline-none'
          />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import type { CommunityProfile, RoleFilter } from '../types'
import { FilterBar } from './FilterBar'
import { ProfileCard } from './ProfileCard'
import { ProfileCardSkeleton } from './ProfileCardSkeleton'

interface CommunityGridProps {
  profiles: CommunityProfile[]
  loading?: boolean
}

export function CommunityGrid({ profiles, loading }: CommunityGridProps) {
  const [activeFilter, setActiveFilter] = useState<RoleFilter>('todos')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    let result = profiles
    if (activeFilter !== 'todos') {
      result = result.filter(p => p.role === activeFilter)
    }
    const q = searchQuery.toLowerCase()
    if (q) {
      result = result.filter(p =>
        p.display_name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.state?.toLowerCase().includes(q)
      )
    }
    return result
  }, [profiles, activeFilter, searchQuery])

  return (
    <div className='flex flex-col gap-8'>
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center gap-2 py-16'>
          <p className='font-baby-doll text-xl text-white/60 uppercase'>No se encontraron perfiles</p>
          <p className='font-pt-mono text-sm text-white/40'>Intenta con otro filtro</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4'>
          {filtered.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  )
}

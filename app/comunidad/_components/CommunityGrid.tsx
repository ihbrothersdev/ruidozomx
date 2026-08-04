'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ROLE_FILTER_LABELS, type CommunityProfile, type RoleFilter } from '../types'
import { FilterBar } from './FilterBar'
import { ProfileCard } from './ProfileCard'
import { ProfileCardSkeleton } from './ProfileCardSkeleton'

interface CommunityGridProps {
  profiles: CommunityProfile[]
  loading?: boolean
}

const PAGE_SIZE = 12

function parseRoleFilter(value: string | null): RoleFilter | null {
  if (!value) return null
  return value in ROLE_FILTER_LABELS ? (value as RoleFilter) : null
}

/** URL `page` param is 1-based; internal state is a 0-based index. */
function parsePageParam(value: string | null): number {
  const n = value ? parseInt(value, 10) : NaN
  return Number.isFinite(n) && n > 1 ? n - 1 : 0
}

export function CommunityGrid({ profiles, loading }: CommunityGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState<RoleFilter | null>(() => parseRoleFilter(searchParams.get('role')))
  const [searchQuery, setSearchQuery] = useState('')
  // Initialized from the URL so returning here (router.back from a profile)
  // restores the page the user was on instead of resetting to the first.
  const [page, setPage] = useState(() => parsePageParam(searchParams.get('page')))

  // Reflect filter + page into the URL (page is 1-based there). Replace, not
  // push, so paging doesn't pollute the browser history.
  function syncUrl(nextFilter: RoleFilter | null, nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (nextFilter) params.set('role', nextFilter)
    else params.delete('role')
    if (nextPage > 0) params.set('page', String(nextPage + 1))
    else params.delete('page')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function goToPage(nextPage: number) {
    setPage(nextPage)
    syncUrl(activeFilter, nextPage)
  }

  function handleFilterChange(next: RoleFilter | null) {
    setActiveFilter(next)
    setPage(0)
    syncUrl(next, 0)
  }

  const filtered = useMemo(() => {
    // Hide admin accounts from the public community grid.
    let result = profiles.filter(p => p.role !== 'admin')
    if (activeFilter) {
      result = result.filter(p => p.role === activeFilter)
    }
    const q = searchQuery.toLowerCase()
    if (q) {
      result = result.filter(
        p =>
          p.display_name.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.genre?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q)
      )
    }
    return result
  }, [profiles, activeFilter, searchQuery])

  function handleSearchChange(next: string) {
    setSearchQuery(next)
    setPage(0)
    syncUrl(activeFilter, 0)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className='flex flex-col gap-8'>
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
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
        <div className='flex flex-col gap-8'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4'>
            {visible.map(profile => (
              <ProfileCard
                key={profile.id}
                profile={profile}
              />
            ))}
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className='flex items-center justify-between border-t border-white/5 pt-4'>
              <span className='font-pt-mono text-[10px] tracking-widest text-white/40 uppercase'>
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className='flex items-center gap-2'>
                <PagerButton
                  disabled={safePage === 0}
                  onClick={() => goToPage(Math.max(0, safePage - 1))}
                >
                  <ChevronLeft className='h-4 w-4' />
                </PagerButton>
                <span className='font-pt-mono px-1 text-[10px] tracking-widest text-white/50 uppercase'>
                  {safePage + 1}/{totalPages}
                </span>
                <PagerButton
                  disabled={safePage >= totalPages - 1}
                  onClick={() => goToPage(safePage + 1)}
                >
                  <ChevronRight className='h-4 w-4' />
                </PagerButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PagerButton({
  children,
  disabled,
  onClick
}: {
  children: React.ReactNode
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className='flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-white/10 bg-white/3 text-white/60 transition-colors hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/3'
    >
      {children}
    </button>
  )
}

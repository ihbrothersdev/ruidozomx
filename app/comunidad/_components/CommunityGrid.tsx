'use client'

import { pageWindow } from '@/lib/pagination'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { COMMUNITY_LISTING_KEY, ROLE_FILTER_LABELS, type CommunityProfile, type RoleFilter } from '../types'
import { FilterBar } from './FilterBar'
import { PageJump } from './PageJump'
import { ProfileCard } from './ProfileCard'
import { ProfileCardSkeleton } from './ProfileCardSkeleton'

interface CommunityGridProps {
  profiles: CommunityProfile[]
  loading?: boolean
  /** Admin-only toggle for accounts missing a confirmed email, a rola, or both. */
  showAdminFilter?: boolean
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

export function CommunityGrid({ profiles, loading, showAdminFilter }: CommunityGridProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // All initialized from the URL so returning here (router.back from a profile)
  // restores the exact listing instead of resetting to the first page.
  const [activeFilter, setActiveFilter] = useState<RoleFilter | null>(() => parseRoleFilter(searchParams.get('role')))
  // Not `q`: the header Buscador owns that param on every page.
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('buscar') ?? '')
  const [onlyPending, setOnlyPending] = useState(
    () => Boolean(showAdminFilter) && searchParams.get('pendientes') === '1'
  )
  const [page, setPage] = useState(() => parsePageParam(searchParams.get('page')))

  const pendingCount = useMemo(() => profiles.filter(p => p.pending && p.role !== 'admin').length, [profiles])

  const filtered = useMemo(() => {
    // Hide admin accounts from the public community grid.
    let result = profiles.filter(p => p.role !== 'admin')
    if (onlyPending) {
      result = result.filter(p => p.pending)
    }
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
  }, [profiles, onlyPending, activeFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  // Native replaceState instead of router.replace: Next keeps useSearchParams in
  // sync without re-rendering the page on the server, which would re-download
  // every profile on each page turn. Replace, not push, so paging doesn't
  // pollute the browser history.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const set = (key: string, value: string | null) => (value ? params.set(key, value) : params.delete(key))
    set('role', activeFilter)
    set('buscar', searchQuery.trim() || null)
    set('pendientes', onlyPending ? '1' : null)
    set('page', safePage > 0 ? String(safePage + 1) : null)
    const query = params.toString()
    const url = query ? `${pathname}?${query}` : pathname
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, '', url)
    try {
      sessionStorage.setItem(COMMUNITY_LISTING_KEY, url)
    } catch {}
  }, [pathname, activeFilter, searchQuery, onlyPending, safePage])

  function handleFilterChange(next: RoleFilter | null) {
    setActiveFilter(next)
    setPage(0)
  }

  function handleSearchChange(next: string) {
    setSearchQuery(next)
    setPage(0)
  }

  function togglePending() {
    setOnlyPending(v => !v)
    setPage(0)
  }

  return (
    <div className='flex flex-col gap-8'>
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        trailing={
          showAdminFilter && (
            <AdminPendingToggle
              on={onlyPending}
              count={pendingCount}
              onToggle={togglePending}
            />
          )
        }
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
            <nav
              aria-label='Paginación'
              className='flex flex-col items-center gap-3 border-t border-white/5 pt-4 sm:flex-row sm:justify-between'
            >
              <span className='font-pt-mono text-[10px] tracking-widest text-white/40 uppercase'>
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className='flex items-center gap-1'>
                <PagerButton
                  disabled={safePage === 0}
                  onClick={() => setPage(safePage - 1)}
                  ariaLabel='Página anterior'
                >
                  <ChevronLeft className='h-4 w-4' />
                </PagerButton>
                {pageWindow(safePage + 1, totalPages, 1).map((p, i) =>
                  p === 'gap' ? (
                    <PageJump
                      key={`gap-${i}`}
                      totalPages={totalPages}
                      onJump={n => setPage(n - 1)}
                    />
                  ) : (
                    <PagerButton
                      key={p}
                      active={p === safePage + 1}
                      onClick={() => setPage(p - 1)}
                    >
                      {p}
                    </PagerButton>
                  )
                )}
                <PagerButton
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage(safePage + 1)}
                  ariaLabel='Página siguiente'
                >
                  <ChevronRight className='h-4 w-4' />
                </PagerButton>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}

/** A rubber stamp: a faint dashed outline when off, "inked" in red when on. */
function AdminPendingToggle({ on, count, onToggle }: { on: boolean; count: number; onToggle: () => void }) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={on}
      onClick={onToggle}
      title='Cuentas que no han confirmado su correo, no han subido rolas, o ambas'
      className={`relative shrink-0 -rotate-3 cursor-pointer transition-all duration-150 active:scale-90 ${on ? 'scale-105' : 'hover:scale-105'}`}
      style={on ? { filter: 'url(#admin-stamp-ink)' } : undefined}
    >
      {/* Speckled mask so the ink looks pressed onto the texture rather than printed. */}
      <svg
        aria-hidden
        width='0'
        height='0'
        className='absolute'
      >
        <filter id='admin-stamp-ink'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency='0.8'
            numOctaves='2'
            seed='4'
            result='noise'
          />
          <feColorMatrix
            in='noise'
            type='matrix'
            values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.75'
            result='mask'
          />
          <feComposite
            in='SourceGraphic'
            in2='mask'
            operator='in'
          />
        </filter>
      </svg>
      <span
        className={`flex items-center gap-3 rounded-[5px] border-[3px] px-4 py-1.5 outline-2 outline-offset-[3px] transition-colors ${
          on
            ? 'border-[#ff0048] text-[#ff0048] outline-[#ff0048]'
            : 'border-dashed border-[#a3a194]/45 text-[#a3a194]/55 outline-transparent hover:border-[#a3a194]/80 hover:text-[#a3a194]'
        }`}
      >
        <span className='flex flex-col items-start leading-none'>
          <span className='font-baby-doll text-xl leading-none uppercase'>Pendientes</span>
          <span className='font-pt-mono mt-0.5 text-[10px] font-bold tracking-[0.35em] uppercase'>correo o rolas</span>
        </span>
        <span className='font-baby-doll flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-current px-1 text-lg leading-none'>
          {count}
        </span>
      </span>
      <span
        aria-hidden
        className={`font-pt-mono absolute -top-2.5 left-3 bg-[#1a1917] px-1 text-[9px] font-bold tracking-[0.3em] uppercase ${on ? 'text-[#ff0048]' : 'text-[#a3a194]/60'}`}
      >
        Admin
      </span>
    </button>
  )
}

function PagerButton({
  children,
  disabled,
  active,
  ariaLabel,
  onClick
}: {
  children: React.ReactNode
  disabled?: boolean
  active?: boolean
  ariaLabel?: string
  onClick: () => void
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={`font-pt-mono flex h-8 min-w-8 cursor-pointer items-center justify-center rounded border px-2 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? 'border-[#ff0048] bg-[#ff0048] text-white'
          : 'border-white/10 bg-white/3 text-white/60 hover:bg-white/8 hover:text-white disabled:hover:bg-white/3'
      }`}
    >
      {children}
    </button>
  )
}

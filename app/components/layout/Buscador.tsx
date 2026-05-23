'use client'

import type { SearchResults } from '@/lib/supabase/search'
import { ROLE_LABELS } from '@/lib/types'
import { formatCassetteDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const DEBOUNCE_MS = 350
const MIN_QUERY_LEN = 3
const COMPACT_LIMIT = 3
const MAX_CACHE_ENTRIES = 50

const ASSET_W = 528
const ASSET_H = 80
const ASSET_ASPECT = `${ASSET_W} / ${ASSET_H}`

function updateQueryParam(value: string) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const trimmed = value.trim()
  if (trimmed) {
    params.set('q', trimmed)
  } else {
    params.delete('q')
  }
  const qs = params.toString()
  const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`
  window.history.replaceState(window.history.state, '', next)
}

export function Buscador() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cacheRef = useRef<Map<string, SearchResults>>(new Map())

  // Auto-fill input with the URL query on first mount (deep-link).
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q')
    if (initial) {
      setQuery(initial)
      setDropdownOpen(true)
    }
  }, [])

  // Click outside closes only the dropdown — input stays visible.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Debounced fetch with an in-session cache. Cache key is the normalized
  // term; cache hit short-circuits the network entirely.
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LEN) {
      setResults(null)
      setLoading(false)
      return
    }

    const cacheKey = trimmed.toLowerCase()
    const cached = cacheRef.current.get(cacheKey)
    if (cached) {
      setResults(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        })
        if (!res.ok) throw new Error('Search failed')
        const data = (await res.json()) as SearchResults
        // FIFO eviction so the cache can't grow unbounded.
        if (cacheRef.current.size >= MAX_CACHE_ENTRIES) {
          const oldest = cacheRef.current.keys().next().value
          if (oldest !== undefined) cacheRef.current.delete(oldest)
        }
        cacheRef.current.set(cacheKey, data)
        setResults(data)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setResults(null)
        }
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      clearTimeout(handle)
    }
  }, [query])

  // Sync the (debounced) query to the URL.
  useEffect(() => {
    const handle = setTimeout(() => updateQueryParam(query), DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [query])

  function clearQuery() {
    setQuery('')
    setResults(null)
    setExpanded(false)
    setDropdownOpen(false)
    updateQueryParam('')
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      clearQuery()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setExpanded(true)
      setDropdownOpen(true)
    }
  }

  const showDropdown = dropdownOpen && query.trim().length >= MIN_QUERY_LEN

  return (
    <div
      ref={containerRef}
      className='relative'
    >
      {/* Input lives INSIDE the asset — the PNG is the background, the
       *  magnifier in the asset replaces the icon, the cream stripe is the
       *  writable area. Scale via height; width follows the asset's aspect. */}
      <div
        className='relative h-9 sm:h-10 md:h-15'
        style={{ aspectRatio: ASSET_ASPECT }}
      >
        <Image
          src='/assets/header/buscador.png'
          alt=''
          width={ASSET_W}
          height={ASSET_H}
          className='pointer-events-none absolute inset-0 h-full w-full'
          priority={false}
        />
        <label className='sr-only'>Buscar</label>
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setDropdownOpen(true)
          }}
          onFocus={() => {
            if (query.trim().length >= MIN_QUERY_LEN) setDropdownOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder='Buscar…'
          aria-label='Buscar bandas, rolas, eventos'
          className='font-pt-mono absolute inset-y-0 right-[4%] left-[15%] w-[81%] bg-transparent text-sm tracking-wide text-black placeholder:text-black/40 focus:outline-none sm:text-base md:text-lg'
        />
        {query && (
          <button
            type='button'
            onClick={clearQuery}
            aria-label='Limpiar búsqueda'
            className='absolute top-1/2 right-[3%] -translate-y-1/2 cursor-pointer rounded-full p-1 text-black/50 hover:bg-black/10 hover:text-black'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-3 w-3 sm:h-3.5 sm:w-3.5'
              aria-hidden='true'
            >
              <path d='M18 6 6 18' />
              <path d='m6 6 12 12' />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className='absolute top-full right-0 z-50 mt-2 w-[min(94vw,520px)] sm:w-[520px]'>
          <div className='relative overflow-hidden rounded-md border-2 border-black/20 bg-[#f5f0e8] shadow-[6px_6px_0_rgba(0,0,0,0.25)]'>
            <div className='pointer-events-none absolute inset-0 z-0 opacity-25'>
              <Image
                src='/assets/registro/explicacion-rol/shared/fondo.png'
                alt=''
                fill
                className='object-cover'
              />
            </div>

            <div className='relative z-10 max-h-[70vh] overflow-y-auto'>
              <ResultsPanel
                loading={loading}
                results={results}
                expanded={expanded}
                onToggleExpand={() => setExpanded(v => !v)}
                onNavigate={clearQuery}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultsPanel({
  loading,
  results,
  expanded,
  onToggleExpand,
  onNavigate
}: {
  loading: boolean
  results: SearchResults | null
  expanded: boolean
  onToggleExpand: () => void
  onNavigate: () => void
}) {
  if (loading && !results) {
    return (
      <div className='font-pt-mono px-5 py-8 text-center text-sm tracking-wider text-black/50 uppercase'>Buscando…</div>
    )
  }
  if (!results) return null
  if (results.total === 0) {
    return (
      <div className='px-5 py-8 text-center'>
        <p className='font-baby-doll text-2xl text-black/70 uppercase'>Nada encontrado</p>
        <p className='font-pt-mono mt-1 text-xs tracking-wider text-black/50 uppercase'>
          para &ldquo;{results.query}&rdquo;
        </p>
      </div>
    )
  }

  const limit = expanded ? Infinity : COMPACT_LIMIT
  const compactCount =
    Math.min(results.profiles.length, COMPACT_LIMIT) +
    Math.min(results.songs.length, COMPACT_LIMIT) +
    Math.min(results.events.length, COMPACT_LIMIT) +
    Math.min(results.cassettes.length, COMPACT_LIMIT)
  const hasMore = results.total > compactCount

  return (
    <div className='flex flex-col'>
      {results.profiles.length > 0 && (
        <Section
          title='Personas'
          count={results.profiles.length}
        >
          {results.profiles.slice(0, limit).map(p => (
            <ResultItem
              key={p.id}
              href={`/perfil/${p.slug}`}
              onNavigate={onNavigate}
              avatar={
                <Avatar
                  photoUrl={p.photo_url}
                  fallback={p.display_name}
                />
              }
              primary={p.display_name}
              secondary={[ROLE_LABELS[p.role] ?? p.role, p.city].filter(Boolean).join(' · ')}
            />
          ))}
        </Section>
      )}

      {results.songs.length > 0 && (
        <Section
          title='Rolas'
          count={results.songs.length}
        >
          {results.songs.slice(0, limit).map(s => (
            <ResultItem
              key={s.id}
              href={`/?song=${s.id}`}
              onNavigate={onNavigate}
              avatar={
                <SideBadge
                  side={s.side}
                  position={s.position}
                />
              }
              primary={s.title}
              secondary={[s.artist, s.genre].filter(Boolean).join(' · ')}
            />
          ))}
        </Section>
      )}

      {results.events.length > 0 && (
        <Section
          title='Eventos'
          count={results.events.length}
        >
          {results.events.slice(0, limit).map(ev => (
            <ResultItem
              key={ev.id}
              href={`/?q=${encodeURIComponent(results.query)}`}
              onNavigate={onNavigate}
              avatar={
                <CoverThumb
                  src={ev.cover_image_url}
                  emoji='♪'
                />
              }
              primary={ev.title}
              secondary={[formatCassetteDate(ev.event_date), ev.venue_name, ev.city].filter(Boolean).join(' · ')}
            />
          ))}
        </Section>
      )}

      {results.cassettes.length > 0 && (
        <Section
          title='Cassettes'
          count={results.cassettes.length}
        >
          {results.cassettes.slice(0, limit).map(c => (
            <ResultItem
              key={c.id}
              href={`/?q=${encodeURIComponent(results.query)}`}
              onNavigate={onNavigate}
              avatar={
                <CoverThumb
                  src={c.cover_image_url}
                  emoji='📼'
                />
              }
              primary={c.name ?? 'Cassette'}
              secondary={[formatCassetteDate(c.start_date), c.curator_name && `Curador: ${c.curator_name}`]
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        </Section>
      )}

      {hasMore && (
        <button
          type='button'
          onClick={onToggleExpand}
          className='font-pt-mono cursor-pointer border-t-2 border-dashed border-black/20 px-4 py-3 text-center text-xs font-bold tracking-wider text-red-600 uppercase hover:bg-black/5'
        >
          {expanded ? 'Mostrar menos' : `Ver los ${results.total} resultados`}
        </button>
      )}
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className='border-t border-black/10 first:border-t-0'>
      <div className='flex items-baseline justify-between px-4 pt-3 pb-1'>
        <h3 className='font-baby-doll text-xl tracking-wide text-red-600 uppercase'>{title}</h3>
        <span className='font-pt-mono text-[10px] tracking-wider text-black/40 uppercase'>{count}</span>
      </div>
      <ul className='pb-2'>{children}</ul>
    </section>
  )
}

function ResultItem({
  href,
  primary,
  secondary,
  avatar,
  onNavigate
}: {
  href: string
  primary: string
  secondary: string
  avatar: React.ReactNode
  onNavigate: () => void
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className='flex items-center gap-3 px-4 py-2 transition-colors hover:bg-black/8'
      >
        <span className='shrink-0'>{avatar}</span>
        <span className='min-w-0 flex-1'>
          <span className='font-pt-mono block truncate text-sm font-bold text-black'>{primary}</span>
          {secondary && (
            <span className='font-pt-mono block truncate text-[11px] tracking-wider text-black/55 uppercase'>
              {secondary}
            </span>
          )}
        </span>
      </Link>
    </li>
  )
}

function Avatar({ photoUrl, fallback }: { photoUrl: string | null; fallback: string }) {
  return (
    <span className='block h-10 w-10 overflow-hidden rounded-full border border-black/30 bg-black/5'>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=''
          className='h-full w-full object-cover'
        />
      ) : (
        <span className='font-baby-doll flex h-full w-full items-center justify-center text-lg text-black/40 uppercase'>
          {fallback.charAt(0)}
        </span>
      )}
    </span>
  )
}

function SideBadge({ side, position }: { side: 'A' | 'B'; position: number }) {
  return (
    <span className='font-baby-doll flex h-10 w-10 items-center justify-center rounded-full border border-black/30 bg-yellow-50 text-base text-black uppercase'>
      {side}
      {position}
    </span>
  )
}

function CoverThumb({ src, emoji }: { src: string | null; emoji: string }) {
  if (src) {
    return (
      <span className='relative block h-10 w-10 overflow-hidden rounded border border-black/30'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=''
          className='h-full w-full object-cover'
        />
      </span>
    )
  }
  return (
    <span className='flex h-10 w-10 items-center justify-center rounded border border-black/30 bg-yellow-50 text-lg'>
      {emoji}
    </span>
  )
}

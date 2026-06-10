'use client'

import type { CassetteHistoryItem } from '@/lib/supabase/cassettes'
import { formatCassetteDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function Caseteca() {
  const [open, setOpen] = useState(false)
  const [cassettes, setCassettes] = useState<CassetteHistoryItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Lazy-load the history the first time the dropdown opens, then cache it.
  function toggle() {
    setOpen(v => !v)
    if (cassettes !== null || loading) return
    setLoading(true)
    fetch('/api/cassettes')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load cassettes')
        return res.json()
      })
      .then((data: { cassettes: CassetteHistoryItem[] }) => setCassettes(data.cassettes))
      .catch(() => setCassettes([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div
      ref={containerRef}
      className='relative'
    >
      <button
        type='button'
        onClick={toggle}
        aria-haspopup='true'
        aria-expanded={open}
        aria-label='Caseteca — historial de cassettes'
        className='flex cursor-pointer transition-transform hover:scale-105'
      >
        {/* caseteca-nav.png is the source art padded with the same transparent
         *  margin the other nav PNGs carry, so an identical height class yields
         *  the same box size, baseline, and visible plaque height. */}
        <Image
          src='/assets/header/caseteca-nav.png'
          alt='Caseteca'
          width={195}
          height={65}
          className='h-9 w-auto sm:h-10 md:h-18'
        />
      </button>

      {open && (
        <div className='absolute top-full left-0 z-50 mt-2 w-[min(94vw,420px)] sm:w-[420px]'>
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
              <div className='flex items-baseline justify-between px-4 pt-3 pb-1'>
                <h3 className='font-baby-doll text-xl tracking-wide text-red-600 uppercase'>Caseteca</h3>
                {cassettes && (
                  <span className='font-pt-mono text-[10px] tracking-wider text-black/40 uppercase'>
                    {cassettes.length}
                  </span>
                )}
              </div>

              {loading && (
                <div className='font-pt-mono px-5 py-8 text-center text-sm tracking-wider text-black/50 uppercase'>
                  Cargando…
                </div>
              )}

              {!loading && cassettes && cassettes.length === 0 && (
                <div className='px-5 py-8 text-center'>
                  <p className='font-baby-doll text-2xl text-black/70 uppercase'>Sin cassettes</p>
                </div>
              )}

              {!loading && cassettes && cassettes.length > 0 && (
                <ul className='pb-2'>
                  {cassettes.map(c => (
                    <li key={c.id}>
                      <Link
                        href={`/?cassette=${c.id}`}
                        onClick={() => setOpen(false)}
                        className='flex items-center gap-3 px-4 py-2 transition-colors hover:bg-black/8'
                      >
                        <CoverThumb src={c.cover_image_url} />
                        <span className='min-w-0 flex-1'>
                          <span className='font-pt-mono flex items-center gap-2 truncate text-sm font-bold text-black'>
                            {c.name ?? 'Cassette'}
                            {c.active && (
                              <span className='font-pt-mono rounded-sm bg-red-600 px-1.5 py-0.5 text-[9px] leading-none tracking-wider text-white uppercase'>
                                Hoy
                              </span>
                            )}
                          </span>
                          <span className='font-pt-mono block truncate text-[11px] tracking-wider text-black/55 uppercase'>
                            {[formatCassetteDate(c.start_date), c.curator_name && `Curador: ${c.curator_name}`]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CoverThumb({ src }: { src: string | null }) {
  if (src) {
    return (
      <span className='relative block h-10 w-10 shrink-0 overflow-hidden rounded border border-black/30'>
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
    <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded border border-black/30 bg-yellow-50 text-lg'>
      📼
    </span>
  )
}

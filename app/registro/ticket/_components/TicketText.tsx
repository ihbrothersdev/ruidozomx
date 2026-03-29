'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Role } from '@/lib/types'
import CompartirModal from '@/app/perfil/_components/CompartirModal'
import ProponerRolaBandaModal from '@/app/perfil/_components/ProponerRolaBandaModal'
import ComparteTuEventoModal from '@/app/perfil/_components/ComparteTuEventoModal'

interface TicketTextProps {
  role: Role
  className?: string
  displayName?: string
}

export default function TicketText({ role, className = '', displayName = '' }: TicketTextProps) {
  const [compartirOpen, setCompartirOpen] = useState(false)
  const [proponerRolaOpen, setProponerRolaOpen] = useState(false)
  const [compartirEventoOpen, setCompartirEventoOpen] = useState(false)

  return (
    <div className={`font-akzidenz grid grid-rows-5 text-center ${className}`}>
      {/* ── Row 1: headline pre-text (role-specific) ── */}
      <div className='flex flex-col items-center justify-end px-1 lg:px-2'>
        {(role === 'promotor' || role === 'agente' || role === 'manager') && (
          <>
            <p className='text-[0.35rem] leading-tight text-black uppercase sm:text-[0.5rem] lg:text-3xl xl:text-4xl'>
              PUBLICA UNA FECHA O UNA
            </p>
            <p className='text-[0.35rem] leading-tight text-black uppercase sm:text-[0.5rem] lg:text-3xl xl:text-4xl'>
              CONVOCATORIA
            </p>
          </>
        )}
        <button
          onClick={() => setCompartirEventoOpen(true)}
          className='group pointer-events-auto flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
        >
          {role === 'venue' && (
            <>
              <p className='text-[0.35rem] leading-tight text-black uppercase sm:text-[0.5rem] lg:text-3xl xl:text-4xl'>
                PUBLICA UNA TOCADA O
              </p>
              <p className='text-[0.35rem] leading-tight text-black uppercase sm:text-[0.5rem] lg:text-2xl xl:text-4xl'>
                ABRE FECHAS DISPONIBLES
              </p>
            </>
          )}
        </button>
        {role === 'fan' && (
          <p className='text-[0.55rem] leading-tight font-bold text-red-500 uppercase sm:text-xs md:text-5xl lg:text-5xl xl:text-5xl'>
            PROPÓN UNA
          </p>
        )}
        {role === 'banda' && (
          <p className='text-[0.55rem] leading-tight font-bold text-black uppercase sm:text-xs lg:text-xl xl:text-2xl'>
            Publica una fecha o una convicatoria
          </p>
        )}

        {role === 'proveedor' && (
          <>
            <p className='text-[0.35rem] leading-tight text-black uppercase sm:text-[0.5rem] lg:text-2xl xl:text-4xl'>
              PUBLICA UN servicio u oferta
            </p>
          </>
        )}
      </div>

      {/* ── Row 2: big headline + detail (role-specific) — clickable to open proponer rola modal ── */}
      <button
        onClick={() => setProponerRolaOpen(true)}
        className='pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
      >
        {(role === 'promotor' || role === 'agente' || role === 'manager') && (
          <>
            <p className='text-[0.55rem] leading-tight font-bold text-red-500 uppercase sm:text-xs lg:text-xl xl:text-5xl'>
              PROPÓN UNA
            </p>
            <p className='text-2xl leading-none font-black text-red-500 uppercase sm:text-3xl lg:text-6xl xl:text-7xl'>
              ROLA
            </p>
            <p className='text-[0.55rem] leading-tight font-bold text-red-500 uppercase sm:text-xs lg:text-xl xl:text-3xl'>
              DE TU TALENTO QUE MUEVES PARA NUESTRO CASETE SEMANAL
            </p>
          </>
        )}
        {role === 'venue' && (
          <>
            <p className='text-[0.55rem] leading-tight font-bold text-red-500 uppercase sm:text-xs lg:text-xl xl:text-5xl'>
              PROPÓN UNA
            </p>
            <p className='text-2xl leading-none font-black text-red-500 uppercase sm:text-3xl lg:text-6xl xl:text-7xl'>
              ROLA
            </p>
            <p className='text-[0.55rem] leading-tight font-bold text-red-500 uppercase sm:text-xs lg:text-xl xl:text-3xl'>
              Del talento que mueves
            </p>
            <p className='text-[0.55rem] leading-tight font-bold text-red-500 uppercase sm:text-xs lg:text-xl xl:text-3xl'>
              para nuestro cassete semanal
            </p>
          </>
        )}
        {role === 'fan' && (
          <>
            <p className='text-[0.55rem] leading-none font-bold text-red-500 uppercase sm:text-2xl md:text-5xl lg:text-8xl xl:text-8xl'>
              ROLA
            </p>
            <p className='mt-0.5 text-[0.35rem] leading-none leading-tight text-red-500 uppercase sm:text-xl lg:text-xl xl:text-xl'>
              PARA NUESTRO CASETE SEMANAL
            </p>
          </>
        )}
        {role === 'banda' && (
          <>
            <p className='text-[0.55rem] leading-tight font-bold text-red-500 uppercase sm:text-xs lg:text-xl xl:text-2xl'>
              PROPÓN UNA DE TUS
            </p>
            <p className='text-2xl leading-none font-black text-red-500 uppercase sm:text-3xl lg:text-6xl xl:text-7xl'>
              ROLAS
            </p>
            <p className='mt-0.5 text-[0.35rem] leading-tight text-red-500 uppercase sm:text-[0.45rem] lg:mt-1 lg:text-xs xl:text-sm'>
              PARA NUESTRO CASETE SEMANAL
            </p>
          </>
        )}
        {role === 'proveedor' && (
          <>
            <p className='text-[0.55rem] leading-tight font-bold text-red-500 uppercase sm:text-xs lg:text-xl xl:text-2xl'>
              PROPÓN UNA
            </p>
            <p className='text-2xl leading-none font-black text-red-500 uppercase sm:text-3xl lg:text-6xl xl:text-7xl'>
              ROLA
            </p>
            <p className='mt-0.5 text-[0.35rem] leading-tight text-red-500 uppercase sm:text-[0.45rem] lg:mt-1 lg:text-xs xl:text-sm'>
              Del talento que mueves
            </p>
            <p className='mt-0.5 text-[0.35rem] leading-tight text-red-500 uppercase sm:text-[0.45rem] lg:mt-1 lg:text-xs xl:text-sm'>
              para nuestro casete semanal
            </p>
          </>
        )}
      </button>

      {/* ── Row 3: Static share text — clickable ── */}
      <button
        onClick={() => setCompartirOpen(true)}
        className='group pointer-events-auto flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
      >
        <p className='text-[0.4rem] leading-tight text-black uppercase group-hover:underline sm:text-[0.55rem] lg:text-2xl xl:text-3xl'>
          CORRE LA VOZ,
        </p>
        <p className='text-[0.4rem] leading-tight text-black uppercase group-hover:underline sm:text-[0.55rem] lg:text-xl xl:text-2xl'>
          HAZ RUIDO ALLÁ AFUERA
        </p>
        <p className='text-[0.4rem] leading-tight text-black uppercase group-hover:underline sm:text-[0.55rem] lg:text-xl xl:text-2xl'>
          COMPÁRTENOS EN TUS REDES
        </p>
      </button>

      {/* ── Row 4: Static CTA — clickable ── */}
      <div className='pointer-events-auto flex items-center justify-center px-1 lg:px-2'>
        <Link
          href='/comunidad'
          className='text-[0.55rem] leading-tight font-black text-black uppercase hover:underline sm:text-xs md:text-3xl lg:text-3xl xl:text-3xl 2xl:text-4xl'
        >
          EXPLORAR LA ESCENA
        </Link>
      </div>

      <CompartirModal
        open={compartirOpen}
        onOpenChange={setCompartirOpen}
      />
      <ProponerRolaBandaModal
        open={proponerRolaOpen}
        onOpenChange={setProponerRolaOpen}
        bandName={displayName}
      />
      <ComparteTuEventoModal
        open={compartirEventoOpen}
        onOpenChange={setCompartirEventoOpen}
      />
    </div>
  )
}

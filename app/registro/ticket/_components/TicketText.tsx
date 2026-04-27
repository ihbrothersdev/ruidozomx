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
        {role === 'manager' && (
          <button
            onClick={() => setProponerRolaOpen(true)}
            className='pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
          >
            <p className='text-4xl leading-tight font-bold text-red-500 uppercase hover:underline md:text-2xl lg:text-5xl xl:text-5xl'>
              PROPÓN UNA
            </p>
          </button>
        )}
        {/* TODO: Uncomment when publica una fecha modal is done */}
        {/* {(role === 'promotor' || role === 'agente' || role === 'manager') && (
          <button className='group pointer-events-auto flex cursor-pointer flex-col items-center'>
            <p className='text-base leading-tight text-black group-hover:underline uppercase md:text-xl lg:text-3xl xl:text-4xl'>
              PUBLICA UNA FECHA O UNA
            </p>
            <p className='text-base leading-tight text-black group-hover:underline uppercase md:text-xl lg:text-3xl xl:text-4xl'>
              CONVOCATORIA
            </p>
          </button>
        )} */}
        <button
          onClick={() => setCompartirEventoOpen(true)}
          className='group pointer-events-auto flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
        >
          {role === 'venue' && (
            <>
              <p className='text-base leading-tight text-black uppercase group-hover:underline md:text-xl lg:text-3xl xl:text-4xl'>
                PUBLICA UNA TOCADA O
              </p>
              <p className='text-base leading-tight text-black uppercase group-hover:underline md:text-xl lg:text-2xl xl:text-4xl'>
                ABRE FECHAS DISPONIBLES
              </p>
            </>
          )}
        </button>
        {role === 'fan' && (
          <button
            onClick={() => setProponerRolaOpen(true)}
            className='pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
          >
            <p className='text-4xl leading-tight font-bold text-red-500 uppercase hover:underline md:text-2xl lg:text-5xl xl:text-5xl'>
              PROPÓN UNA
            </p>
          </button>
        )}
        {role === 'banda' && (
          <button
            onClick={() => setProponerRolaOpen(true)}
            className='pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
          >
            <p className='text-2xl leading-tight font-bold text-red-500 uppercase hover:underline md:text-2xl lg:text-5xl xl:text-5xl'>
              PROPÓN UNA DE TUS
            </p>
          </button>
        )}
        {/* TODO: Uncomment when publica una fecha modal is done */}
        {/* {role === 'proveedor' && (
          <button
            className='pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
          >
            <p className='text-base leading-tight text-black uppercase md:text-xl lg:text-2xl xl:text-4xl'>
              PUBLICA UNA PROMO
            </p>
          </button>
        )} */}
      </div>

      {/* ── Row 2: big headline + detail (role-specific) — clickable to open proponer rola modal ── */}
      <button
        onClick={() => setProponerRolaOpen(true)}
        className='group pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
      >
        {role === 'manager' && (
          <>
            <p className='text-7xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl xl:text-7xl'>
              ROLA
            </p>
            <p className='text-md leading-tight text-red-500 uppercase group-hover:underline md:text-sm lg:text-xl xl:text-3xl'>
              Del talento que mueves
            </p>
            <p className='text-md leading-tight text-black uppercase group-hover:underline md:text-sm lg:text-xl xl:text-3xl'>
              para nuestro cassete semanal
            </p>
          </>
        )}
        {(role === 'promotor' || role === 'agente') && (
          <>
            <p className='text-xl leading-tight text-red-500 uppercase group-hover:underline md:text-lg lg:text-xl xl:text-5xl'>
              PROPÓN UNA
            </p>
            <p className='text-6xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl xl:text-7xl'>
              ROLA
            </p>
            <p className='text-md leading-tight text-red-500 uppercase group-hover:underline md:text-sm lg:text-xl xl:text-3xl'>
              Del talento que mueves
            </p>
            <p className='text-md leading-tight text-black uppercase group-hover:underline md:text-sm lg:text-xl xl:text-3xl'>
              para nuestro cassete semanal
            </p>
          </>
        )}
        {role === 'venue' && (
          <button className='group pointer-events-auto cursor-pointer'>
            <p className='text-xl leading-tight text-red-500 uppercase group-hover:underline md:text-xl lg:text-xl xl:text-5xl'>
              PROPÓN UNA
            </p>
            <p className='text-6xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl xl:text-7xl'>
              ROLA
            </p>
            <p className='text-md leading-tight text-red-500 uppercase group-hover:underline md:text-sm lg:text-xl xl:text-3xl'>
              De tu banda o artista favorito
            </p>
            <p className='text-md leading-tight text-black uppercase group-hover:underline md:text-sm lg:text-xl xl:text-3xl'>
              para nuestro cassete semanal
            </p>
          </button>
        )}
        {role === 'fan' && (
          <>
            <p className='text-7xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl xl:text-7xl'>
              ROLA
            </p>
            <p className='text-md leading-tight text-red-500 uppercase group-hover:underline md:text-sm lg:text-xl xl:text-3xl'>
              De tu banda o artista favorito
            </p>
            <p className='text-md leading-tight text-black uppercase group-hover:underline md:text-sm lg:text-xl xl:text-3xl'>
              para nuestro cassete semanal
            </p>
          </>
        )}
        {role === 'banda' && (
          <>
            <p className='text-7xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl xl:text-9xl'>
              ROLAS
            </p>
            <p className='text-md text-BLACK mt-0.5 leading-tight uppercase group-hover:underline md:text-xs lg:mt-1 lg:text-xl xl:text-3xl'>
              PARA NUESTRO CASSETE SEMANAL
            </p>
          </>
        )}
        {role === 'proveedor' && (
          <>
            <p className='text-xl leading-tight text-red-500 uppercase group-hover:underline md:text-lg lg:text-xl xl:text-4xl'>
              PROPÓN UNA
            </p>
            <p className='text-6xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl xl:text-8xl'>
              ROLA
            </p>
            <p className='mt-0.5 text-xs leading-tight text-red-500 uppercase group-hover:underline md:text-xs lg:mt-1 lg:text-sm xl:text-xl'>
              De tu banda o artista favorito
            </p>
            <p className='mt-0.5 text-xs leading-tight text-black uppercase group-hover:underline md:text-xs lg:mt-1 lg:text-sm xl:text-xl'>
              para nuestro cassete semanal
            </p>
          </>
        )}
      </button>

      {/* ── Row 3: Static share text — clickable ── */}
      <button
        onClick={() => setCompartirOpen(true)}
        className='group pointer-events-auto flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
      >
        <p className='text-base leading-tight text-black uppercase group-hover:underline lg:text-2xl xl:text-3xl'>
          CORRE LA VOZ,
        </p>
        <p className='text-base leading-tight text-black uppercase group-hover:underline lg:text-xl xl:text-2xl'>
          HAZ RUIDO ALLÁ AFUERA
        </p>
        <p className='text-base leading-tight text-black uppercase group-hover:underline lg:text-xl xl:text-2xl'>
          COMPÁRTENOS EN TUS REDES
        </p>
      </button>

      {/* ── Row 4: Static CTA — clickable ── */}
      <div className='pointer-events-auto flex items-center justify-center px-1 lg:px-2'>
        <Link
          href='/comunidad'
          className='text-xl leading-tight text-black uppercase hover:underline md:text-3xl lg:text-3xl xl:text-3xl 2xl:text-4xl'
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
        bandName=''
        showVibes={false}
      />
      <ComparteTuEventoModal
        open={compartirEventoOpen}
        onOpenChange={setCompartirEventoOpen}
      />
    </div>
  )
}

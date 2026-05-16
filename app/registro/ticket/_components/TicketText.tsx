'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sileo } from 'sileo'
import type { Role } from '@/lib/types'
import CompartirModal from '@/app/perfil/_components/CompartirModal'
import ProponerRolaBandaModal from '@/app/perfil/_components/ProponerRolaBandaModal'
import ComparteTuEventoModal from '@/app/perfil/_components/ComparteTuEventoModal'

interface TicketTextProps {
  role: Role
  className?: string
  displayName?: string
  /** When false, ticket buttons re-trigger the "confirma tu correo" toast
   *  instead of opening modals — the user can't act until their account is active. */
  isLoggedIn?: boolean
  /** Venues only: when true, the venue already opted in to publishing
   *  convocatorias — hide the "PUBLICA UNA TOCADA / ABRE FECHAS" CTA. */
  venuePublishesCalls?: boolean
}

export default function TicketText({
  role,
  className = '',
  displayName = '',
  isLoggedIn = false,
  venuePublishesCalls = false
}: TicketTextProps) {
  const [compartirOpen, setCompartirOpen] = useState(false)
  const [proponerRolaOpen, setProponerRolaOpen] = useState(false)
  const [compartirEventoOpen, setCompartirEventoOpen] = useState(false)

  /** Wrap any modal-opener so it fires the confirmation toast when the user
   *  hasn't confirmed their email yet. */
  function gated(open: () => void) {
    return () => {
      if (!isLoggedIn) {
        sileo.info({
          title: 'Confirma tu correo electrónico',
          description: 'Revisa tu bandeja de entrada (y spam) para activar tu cuenta.',
          position: 'top-center',
          duration: 6000
        })
        return
      }
      open()
    }
  }

  return (
    <div className={`font-akzidenz grid grid-rows-5 text-center ${className}`}>
      {/* ── Row 1: headline pre-text (role-specific) ── */}
      <div className='flex flex-col items-center justify-end px-1 lg:px-2'>
        {role === 'manager' && (
          <button
            onClick={gated(() => setProponerRolaOpen(true))}
            className='pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
          >
            <p className='text-3xl leading-tight font-bold text-red-500 uppercase hover:underline md:text-2xl lg:text-4xl'>
              PROPÓN UNA
            </p>
          </button>
        )}
        {(role === 'promotor' || role === 'agente') && (
          <button
            onClick={gated(() => setCompartirEventoOpen(true))}
            className='group pointer-events-auto flex cursor-pointer flex-col items-center'
          >
            <p className='text-base leading-tight text-black uppercase group-hover:underline md:text-xl lg:text-3xl'>
              PUBLICA UNA FECHA O UNA
            </p>
            <p className='text-base leading-tight text-black uppercase group-hover:underline md:text-xl lg:text-3xl'>
              CONVOCATORIA
            </p>
          </button>
        )}
        <button
          onClick={gated(() => setCompartirEventoOpen(true))}
          className='group pointer-events-auto flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
        >
          {role === 'venue' && !venuePublishesCalls && (
            <>
              <p className='text-base leading-tight text-black uppercase group-hover:underline md:text-xl lg:text-2xl'>
                PUBLICA UNA TOCADA O
              </p>
              <p className='text-base leading-tight text-black uppercase group-hover:underline md:text-xl lg:text-2xl'>
                ABRE FECHAS DISPONIBLES
              </p>
            </>
          )}
        </button>
        {role === 'fan' && (
          <button
            onClick={gated(() => setProponerRolaOpen(true))}
            className='pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
          >
            <p className='text-3xl leading-tight font-bold text-red-500 uppercase hover:underline md:text-2xl lg:text-5xl xl:text-5xl'>
              PROPÓN UNA
            </p>
          </button>
        )}
        {role === 'banda' && (
          <button
            onClick={gated(() => setCompartirEventoOpen(true))}
            className='pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
          >
            <>
              <p className='text-base leading-tight text-black uppercase group-hover:underline md:text-xl lg:text-3xl'>
                PUBLICA UNA FECHA O
              </p>
              <p className='text-base leading-tight text-black uppercase group-hover:underline md:text-xl lg:text-3xl'>
                UNA CONVOCATORIA
              </p>
            </>
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
        onClick={gated(() => setProponerRolaOpen(true))}
        className='group pointer-events-auto row-span-2 flex cursor-pointer flex-col items-center justify-center px-1 lg:px-2'
      >
        {role === 'manager' && (
          <>
            <p className='text-6xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl'>
              ROLA
            </p>
            <p className='text-md leading-tight text-red-500 uppercase group-hover:underline md:text-sm lg:text-xl'>
              Del talento que mueves
            </p>
            <p className='text-xs leading-tight text-black uppercase group-hover:underline md:text-sm lg:text-xl'>
              para nuestro cassete semanal
            </p>
          </>
        )}
        {(role === 'promotor' || role === 'agente') && (
          <>
            <p className='text-xl leading-tight text-red-500 uppercase group-hover:underline md:text-lg lg:text-2xl'>
              PROPÓN UNA
            </p>
            <p className='text-5xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl'>
              ROLA
            </p>
            <p className='text-md leading-tight text-red-500 uppercase group-hover:underline md:text-sm lg:text-xl'>
              Del talento que mueves
            </p>
            <p className='text-xs leading-tight text-black uppercase group-hover:underline md:text-sm lg:text-xl'>
              para nuestro cassete semanal
            </p>
          </>
        )}
        {role === 'venue' && (
          <button className='group pointer-events-auto cursor-pointer'>
            <p className='text-xl leading-tight text-red-500 uppercase group-hover:underline md:text-xl lg:text-2xl'>
              PROPÓN UNA
            </p>
            <p className='text-5xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl'>
              ROLA
            </p>
            <p className='text-xs leading-tight text-red-500 uppercase group-hover:underline md:text-sm lg:text-xl'>
              De tu banda o artista favorito
            </p>
            <p className='text-xs leading-tight text-black uppercase group-hover:underline md:text-sm lg:text-xl'>
              para nuestro cassete semanal
            </p>
          </button>
        )}
        {role === 'fan' && (
          <>
            <p className='text-6xl leading-none font-black text-red-500 uppercase group-hover:underline sm:text-7xl md:text-5xl lg:text-6xl'>
              ROLA
            </p>
            <p className='sm:text-md text-xs leading-tight text-red-500 uppercase group-hover:underline md:text-sm lg:text-xl'>
              De tu banda o artista favorito
            </p>
            <p className='sm:text-md text-xs leading-tight text-black uppercase group-hover:underline md:text-sm lg:text-xl'>
              para nuestro cassete semanal
            </p>
          </>
        )}
        {role === 'banda' && (
          <button className='group pointer-events-auto cursor-pointer'>
            <p className='text-xl leading-tight text-red-500 uppercase group-hover:underline md:text-xl lg:text-2xl'>
              PROPÓN UNA DE TUS
            </p>
            <p className='text-6xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-5xl xl:text-8xl'>
              ROLAS
            </p>
            <p className='mt-0.5 text-xs leading-tight text-red-500 uppercase group-hover:underline md:text-xs lg:mt-1 lg:text-xl xl:text-xl'>
              PARA NUESTRO CASSETE SEMANAL
            </p>
          </button>
        )}
        {role === 'proveedor' && (
          <>
            <p className='text-xl leading-tight text-red-500 uppercase group-hover:underline md:text-lg lg:text-2xl'>
              PROPÓN UNA
            </p>
            <p className='text-6xl leading-none font-black text-red-500 uppercase group-hover:underline md:text-5xl lg:text-6xl'>
              ROLA
            </p>
            <p className='mt-0.5 text-xs leading-tight text-red-500 uppercase group-hover:underline md:text-xs lg:mt-1 lg:text-sm xl:text-lg'>
              De tu banda o artista favorito
            </p>
            <p className='mt-0.5 text-xs leading-tight text-black uppercase group-hover:underline md:text-xs lg:mt-1 lg:text-sm xl:text-lg'>
              para nuestro cassete semanal
            </p>
          </>
        )}
      </button>

      {/* ── Row 3: Static share text — clickable ── */}
      <button
        onClick={gated(() => setCompartirOpen(true))}
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

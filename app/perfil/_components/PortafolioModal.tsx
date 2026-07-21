'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { sileo } from 'sileo'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Textarea } from '@/app/components/ui/textarea'
import { sendPortfolioQuote } from '../actions'

interface PortafolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SERVICIOS = ['Portada', 'Merch', 'Cartel', 'Press Kit', 'Redes Sociales', 'Branding', 'Otro']

const maxMensaje = 600

export default function PortafolioModal({ open, onOpenChange }: PortafolioModalProps) {
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [mensaje, setMensaje] = useState('')
  const [sending, setSending] = useState(false)

  // Something to go on: at least one service or a written message.
  const canSubmit = seleccionados.length > 0 || mensaje.trim().length > 0

  function toggle(servicio: string) {
    setSeleccionados(prev => (prev.includes(servicio) ? prev.filter(s => s !== servicio) : [...prev, servicio]))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit || sending) return

    setSending(true)
    const result = await sendPortfolioQuote({ servicios: seleccionados, message: mensaje })
    setSending(false)

    if (result.error) {
      sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
      return
    }

    sileo.success({
      title: '¡Enviado!',
      description: 'Revisaremos tu solicitud. Te contactaremos pronto.',
      position: 'top-center',
      duration: 4000
    })
    setSeleccionados([])
    setMensaje('')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='max-h-[90vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-2xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>¿Qué necesitas? Pide una cotización sin compromiso</DialogTitle>

        <div className='relative'>
          <Image
            src='/assets/gray-bg.png'
            alt=''
            width={600}
            height={1004}
            className='absolute inset-0 h-full w-full object-cover'
          />

          <form
            onSubmit={handleSubmit}
            className='relative z-10 flex flex-col px-6 py-8 sm:px-10'
          >
            <Image
              src='/assets/portafolio/que-necesitas.png'
              alt='¿Qué necesitas?'
              width={520}
              height={89}
              className='h-auto w-full max-w-80 self-center sm:max-w-md'
            />

            <div className='mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <ul className='space-y-1.5'>
                {SERVICIOS.map(servicio => (
                  <li key={servicio}>
                    <label className='flex cursor-pointer items-center gap-2.5'>
                      <Checkbox
                        checked={seleccionados.includes(servicio)}
                        onCheckedChange={() => toggle(servicio)}
                        className='size-5 rounded-none border-2 border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white'
                      />
                      <span className='font-pt-mono text-base font-bold text-black'>{servicio}</span>
                    </label>
                  </li>
                ))}
              </ul>

              <Link
                href='/portafolio'
                className='group flex items-center gap-2 self-start transition-transform hover:scale-105'
              >
                <Image
                  src='/assets/portafolio/trabajos.png'
                  alt='Ver trabajos recientes'
                  width={279}
                  height={26}
                  className='h-auto w-48'
                />
                <ArrowRight
                  className='h-5 w-5 shrink-0 text-black transition-transform group-hover:translate-x-1'
                  strokeWidth={3}
                  aria-hidden
                />
              </Link>
            </div>

            {/* "Cuéntanos más y te enviamos una cotización sin compromiso" */}
            <Image
              src='/assets/portafolio/cotizacion.png'
              alt='Cuéntanos más y te enviamos una cotización sin compromiso'
              width={373}
              height={59}
              className='mt-6 h-auto w-full max-w-sm self-center'
            />

            {/* Mensaje */}
            <Textarea
              value={mensaje}
              onChange={e => setMensaje(e.target.value.slice(0, maxMensaje))}
              placeholder='Cuéntanos sobre tu proyecto…'
              className='font-pt-mono mt-5 min-h-52 max-w-full resize-none rounded-none border-2 border-red-600 bg-transparent px-3 py-2 text-sm text-black shadow-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'
            />
            <span className='font-pt-mono mt-1 self-end text-xs text-black/50'>
              {mensaje.length}/{maxMensaje}
            </span>

            {/* Enviar */}
            <button
              type='submit'
              disabled={!canSubmit || sending}
              className='font-pt-mono mt-5 cursor-pointer self-center rounded-sm bg-black px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

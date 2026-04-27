'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Textarea } from '@/app/components/ui/textarea'
import { Label } from '@/app/components/ui/label'
import type { Role } from '@/lib/types'
import { sileo } from 'sileo'
import { sendProposal } from '../actions'

interface EnviarPropuestaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId?: string
  profileName: string
  profileRole: Role | null
  onSuccess?: () => void
}

const ROLE_PLACEHOLDERS: Record<string, string> = {
  banda: 'Tocada / Colaboración / Prensa/Entrevista / Booking / Otro',
  venue: 'Quiero tocar aquí / Convocatoria / Alianza / Co-producir / Otro',
  promotor: 'Quiero entrar a tu cartel / Pitch de evento / Alianza / Otro',
  manager: 'Representación / Booking / Pitch de artista / Otro',
  agente: 'Representación / Booking / Pitch de artista / Otro',
  proveedor: 'Cotización / Disponibilidad / Colaboración / Otro',
}

const textareaCls =
  'max-w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-1.5 font-pt-mono text-sm text-black shadow-none resize-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'

export default function EnviarPropuestaModal({ open, onOpenChange, profileId, profileName, profileRole, onSuccess }: EnviarPropuestaModalProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const maxChars = 900

  async function handleSubmit() {
    if (!message.trim()) return
    if (!profileId) {
      sileo.error({ title: 'Error', description: 'No se pudo identificar el perfil destino.', position: 'top-center', duration: 4000 })
      return
    }
    setSending(true)
    const result = await sendProposal({ toProfileId: profileId, message })
    setSending(false)
    if (result.error) {
      sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
    } else {
      setSent(true)
      setMessage('')
      onSuccess?.()
      setTimeout(() => {
        setSent(false)
        onOpenChange(false)
      }, 2500)
    }
  }

  const placeholder = profileRole ? ROLE_PLACEHOLDERS[profileRole] ?? 'Escribe tu propuesta...' : 'Escribe tu propuesta...'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-h-[90vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-2xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Enviar propuesta</DialogTitle>

        <div className='relative'>
          {sent ? (
            <div className='flex items-center justify-center p-6'>
              <Image
                src='/assets/success-propuesta.png'
                alt='Propuesta enviada'
                width={500}
                height={400}
                className='h-auto w-full max-w-md'
                unoptimized
              />
            </div>
          ) : (
          <div className='relative min-h-full'>
            <Image
              src='/assets/membrete-background.png'
              alt=''
              width={600}
              height={500}
              className='absolute inset-0 h-full w-full object-fill'
              unoptimized
            />

            {/* Content */}
            <div className='relative z-10 flex flex-col pt-6 pr-6 pb-6 pl-15 sm:pr-10 sm:pl-28'>
              {/* Title image */}
              <Image
                src='/assets/enviar-propuesta-title.png'
                alt='Enviar Propuesta'
                width={315}
                height={57}
                className='h-auto w-full max-w-64 sm:max-w-72'
                unoptimized
              />

              {/* Sub */}
              <p className='font-pt-mono mt-2 text-sm tracking-wider text-black'>
                Sub: &ldquo;Para: <span className='font-bold'>{profileName}</span>&rdquo;
              </p>

              {/* Description */}
              <p className='font-pt-mono mt-2text-xs leading-relaxed tracking-wider text-red-600'>
                Esto se envía dentro de RU!DOZO.
                <br />
                Nadie ve tu contacto hasta que acepten.
              </p>

              {/* Form */}
              <div className='mt-5 w-full space-y-4'>
                {/* Tipo de propuesta */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                    Tipo de propuesta
                  </Label>
                  <p className='font-pt-mono text-xs tracking-wider text-black'>
                    ¿Qué traes en mente? Pon fecha/ciudad si aplica.
                  </p>
                </div>

                {/* Message textarea with role-specific placeholder */}
                <Textarea
                  value={message}
                  onChange={e => {
                    if (e.target.value.length <= maxChars) setMessage(e.target.value)
                  }}
                  rows={10}
                  placeholder={placeholder}
                  className={textareaCls}
                />
                <p className='font-pt-mono text-right text-[10px] tracking-wider text-black/40'>
                  {message.length}/{maxChars}
                </p>
              </div>

              {/* Action buttons */}
              <div className='mt-5 flex justify-end gap-3'>
                <button
                  onClick={handleSubmit}
                  disabled={sending || !message.trim()}
                  className='font-pt-mono cursor-pointer rounded-sm bg-black px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className='font-pt-mono cursor-pointer rounded-sm bg-red-600 px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-red-700 active:scale-95'
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

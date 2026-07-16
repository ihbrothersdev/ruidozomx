'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Textarea } from '@/app/components/ui/textarea'
import { Label } from '@/app/components/ui/label'
import type { Role } from '@/lib/types'
import { sileo } from 'sileo'
import { sendProposal } from '../actions'
import { AdminButton } from '@/app/admin/_components/kit'

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
  proveedor: 'Cotización / Disponibilidad / Colaboración / Otro'
}

const textareaCls =
  'max-w-full resize-none rounded-none border-2 border-admin-ink bg-admin-paper px-3 py-1.5 font-pt-mono text-sm text-admin-ink shadow-none placeholder:text-admin-ink-faint focus-visible:border-admin-red focus-visible:ring-0'

export default function EnviarPropuestaModal({
  open,
  onOpenChange,
  profileId,
  profileName,
  profileRole,
  onSuccess
}: EnviarPropuestaModalProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const maxChars = 900

  async function handleSubmit() {
    if (!message.trim()) return
    if (!profileId) {
      sileo.error({
        title: 'Error',
        description: 'No se pudo identificar el perfil destino.',
        position: 'top-center',
        duration: 4000
      })
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

  const placeholder = profileRole
    ? (ROLE_PLACEHOLDERS[profileRole] ?? 'Escribe tu propuesta...')
    : 'Escribe tu propuesta...'

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='admin-hard max-h-[90vh] overflow-y-auto border-2 border-admin-ink bg-admin-surface p-0 text-admin-ink sm:max-w-lg'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Enviar propuesta</DialogTitle>

        {sent ? (
          <div className='flex items-center justify-center p-6'>
            <Image
              src='/assets/success-propuesta.png'
              alt='Propuesta enviada'
              width={500}
              height={400}
              className='h-auto w-full max-w-md'
            />
          </div>
        ) : (
          <div className='flex flex-col p-6 sm:p-8'>
            <h2 className='font-baby-doll text-4xl text-admin-ink'>Enviar Propuesta</h2>

            {/* Sub */}
            <p className='font-pt-mono mt-3 text-sm tracking-wider text-admin-ink-soft'>
              Sub: &ldquo;Para: <span className='font-bold text-admin-ink'>{profileName}</span>&rdquo;
            </p>

            {/* Description */}
            <p className='font-pt-mono mt-2 text-xs leading-relaxed tracking-wider text-admin-red'>
              Esto se envía dentro de RU!DOZO.
              <br />
              Nadie ve tu contacto hasta que acepten.
            </p>

            {/* Form */}
            <div className='mt-5 w-full space-y-4'>
              {/* Tipo de propuesta */}
              <div className='space-y-1'>
                <Label className='font-pt-mono text-sm font-bold tracking-wider text-admin-ink uppercase'>
                  Tipo de propuesta
                </Label>
                <p className='font-pt-mono text-xs tracking-wider text-admin-ink-soft'>
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
              <p className='font-pt-mono text-right text-[10px] tracking-wider text-admin-ink-faint'>
                {message.length}/{maxChars}
              </p>
            </div>

            {/* Action buttons */}
            <div className='mt-5 flex justify-end gap-3'>
              <AdminButton
                variant='solid'
                onClick={handleSubmit}
                disabled={sending || !message.trim()}
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </AdminButton>
              <AdminButton
                variant='primary'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </AdminButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

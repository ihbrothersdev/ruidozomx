'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Label } from '@/app/components/ui/label'
import { Checkbox } from '@/app/components/ui/checkbox'
import { getAnonSessionId } from '@/lib/analytics/session'
import { sileo } from 'sileo'
import { sendInterest } from '../actions'
import { AdminButton } from '@/app/admin/_components/kit'

interface ConectarModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId?: string
  profileName: string
  onSuccess?: () => void
}

const MOTIVOS = ['Me interesa colaborar', 'Quiero invitar/agendar', 'Me interesa tu trabajo']

export default function ConectarModal({ open, onOpenChange, profileId, profileName, onSuccess }: ConectarModalProps) {
  const [selectedMotivos, setSelectedMotivos] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (selectedMotivos.length === 0) return
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
    // Song/cassette context arrives via the URL when the user reached this
    // profile from the player (e.g. /perfil/slug?song=…&cassette=…), letting
    // the interest_click attribute back to what they were listening to.
    const params = new URLSearchParams(window.location.search)
    const result = await sendInterest({
      toProfileId: profileId,
      motivo: selectedMotivos.join(' / '),
      songId: params.get('song'),
      cassetteId: params.get('cassette'),
      sessionId: getAnonSessionId() || null
    })
    setSending(false)
    if (result.error) {
      sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
    } else {
      setSent(true)
      setSelectedMotivos([])
      onSuccess?.()
      setTimeout(() => {
        setSent(false)
        onOpenChange(false)
      }, 2500)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='admin-hard max-h-[90vh] overflow-y-auto border-2 border-admin-ink bg-admin-surface p-0 text-admin-ink sm:max-w-lg'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Conectar</DialogTitle>

        {sent ? (
          <div className='flex items-center justify-center p-6'>
            <Image
              src='/assets/success-conectar.png'
              alt='Conexión enviada'
              width={500}
              height={400}
              className='h-auto w-full max-w-md'
            />
          </div>
        ) : (
          <div className='flex flex-col p-6 sm:p-8'>
            <h2 className='font-baby-doll text-4xl text-admin-ink'>Conectar</h2>

            {/* Sub */}
            <p className='font-pt-mono mt-3 text-sm tracking-wider text-admin-ink-soft'>
              Sub: &ldquo;Para: <span className='font-bold text-admin-ink'>{profileName}</span>&rdquo;
            </p>

            {/* Description */}
            <p className='font-pt-mono mt-2 text-xs leading-relaxed tracking-wider text-admin-red'>
              Dejas tu interés y el perfil
              <br />
              decide si te abre canal
            </p>

            {/* Motivo section */}
            <div className='mt-6 w-full space-y-3'>
              <p className='font-pt-mono text-sm font-bold tracking-wider text-admin-ink uppercase'>Motivo</p>

              <div className='flex flex-col gap-2'>
                {MOTIVOS.map(motivo => (
                  <div
                    key={motivo}
                    className='flex items-center gap-2'
                  >
                    <Checkbox
                      id={`motivo-${motivo}`}
                      checked={selectedMotivos.includes(motivo)}
                      onCheckedChange={checked => {
                        setSelectedMotivos(prev => (checked ? [...prev, motivo] : prev.filter(m => m !== motivo)))
                      }}
                      className='h-4 w-4 rounded-none border-2 border-admin-ink data-[state=checked]:border-admin-red data-[state=checked]:bg-admin-red data-[state=checked]:text-admin-surface'
                    />
                    <Label
                      htmlFor={`motivo-${motivo}`}
                      className='font-pt-mono cursor-pointer text-xs font-bold tracking-wider text-admin-ink uppercase'
                    >
                      {motivo}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className='mt-6 flex justify-end gap-3'>
              <AdminButton
                variant='solid'
                onClick={handleSubmit}
                disabled={selectedMotivos.length === 0 || sending}
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

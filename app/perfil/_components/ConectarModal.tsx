'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Label } from '@/app/components/ui/label'
import { Checkbox } from '@/app/components/ui/checkbox'

interface ConectarModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileName: string
}

const MOTIVOS = ['Me interesa colaborar', 'Quiero invitar/agendar', 'Me interesa tu trabajo']

export default function ConectarModal({ open, onOpenChange, profileName }: ConectarModalProps) {
  const [selectedMotivo, setSelectedMotivo] = useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-h-[90vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-2xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Conectar</DialogTitle>

        <div className='relative'>
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
            <div className='relative z-10 flex flex-col items-center pt-6 pr-6 pb-6 pl-15 sm:pr-10 sm:pl-28'>
              {/* Title image */}
              <Image
                src='/assets/conectar-title.png'
                alt='Conectar'
                width={315}
                height={57}
                className='h-auto w-full max-w-43 sm:max-w-40'
                unoptimized
              />

              {/* Motivo section */}
              <div className='mt-6 w-full space-y-3'>

              {/* Sub */}
              <p className='font-pt-mono mt-2 text-sm tracking-wider text-black'>
                Sub: &ldquo;Para: <span className='font-bold'>{profileName}</span>&rdquo;
              </p>

              {/* Description */}
              <p className='font-pt-mono mt-2 text-xs ml-12 leading-relaxed tracking-wider text-red-600'>
                Dejas tu interés y el perfil
                <br />
                decide si te abre canal
              </p>

                <p className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                  Motivo
                </p>

                <div className='flex flex-col gap-2'>
                  {MOTIVOS.map(motivo => (
                    <div key={motivo} className='flex items-center gap-2'>
                      <Checkbox
                        id={`motivo-${motivo}`}
                        checked={selectedMotivo === motivo}
                        onCheckedChange={() => setSelectedMotivo(prev => (prev === motivo ? null : motivo))}
                        className='h-4 w-4 rounded-none border-1 border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                      />
                      <Label
                        htmlFor={`motivo-${motivo}`}
                        className='font-pt-mono cursor-pointer text-xs font-bold tracking-wider text-black uppercase'
                      >
                        {motivo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className='mt-6 flex items-center gap-3'>
                <button
                  disabled={!selectedMotivo}
                  className='font-pt-mono cursor-pointer rounded-sm bg-black px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Enviar
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

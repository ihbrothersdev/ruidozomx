'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'

interface ProponerRolaBandaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bandName: string
}

const VIBES = [
  'Joyita escondida',
  'Clásico',
  'Raza',
  'Psicodélica',
  'Nostálgica',
  'Oscura',
  'Hipnótica',
  'Para manejar de noche',
  'Madrugada',
  'Última del bar',
  'Nuevo descubrimiento'
]

const inputCls =
  'h-auto max-w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-1.5 font-pt-mono text-sm text-black shadow-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'

export default function ProponerRolaBandaModal({ open, onOpenChange, bandName }: ProponerRolaBandaModalProps) {
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => (prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]))
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
        <DialogTitle className='sr-only'>Proponer rola de esta banda</DialogTitle>

        <div className='relative'>
          {/* Membrete background */}
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
            <div className='relative z-10 flex flex-col items-center pt-4 pr-6 pb-6 pl-15 sm:pr-10 sm:pl-28'>
              {/* Title image */}
              <Image
                src='/assets/proponer-rola-sm.png'
                alt='Propón una rola'
                width={315}
                height={57}
                className='h-auto w-full max-w-64 sm:max-w-72'
                unoptimized
              />

              {/* Subtitle */}
              <p className='font-pt-mono text-md mt-3 text-center leading-tight tracking-wider text-red-600'>
                Esta rola se va a la fila de curaduría
                <br />
                del casete semanal
              </p>

              {/* Form */}
              <div className='mt-5 w-full space-y-4'>
                {/* Banda/Proyecto — prellenado bloqueado */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                    Banda/Proyecto: {bandName}
                  </Label>
                </div>

                {/* Nombre de la rola */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                    Nombre de la rola
                  </Label>
                  <Input
                    name='title'
                    placeholder=''
                    className={inputCls}
                  />
                </div>

                {/* Link de escucha */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                    Link de escucha
                  </Label>
                  <Input
                    name='external_link'
                    type='url'
                    placeholder='Spotify, YouTube, Bandcamp, SoundCloud o link directo'
                    className={inputCls}
                  />
                </div>

                {/* Vibes section */}
                <div className='space-y-2'>
                  <p className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>¿Qué te vibra?</p>
                  <div className='flex flex-col gap-1.5'>
                    {VIBES.map(vibe => (
                      <div
                        key={vibe}
                        className='flex items-center gap-2'
                      >
                        <Checkbox
                          id={`vibe-${vibe}`}
                          checked={selectedVibes.includes(vibe)}
                          onCheckedChange={() => toggleVibe(vibe)}
                          className='h-4 w-4 rounded-none border-1 border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                        />
                        <Label
                          htmlFor={`vibe-${vibe}`}
                          className='font-pt-mono cursor-pointer text-xs tracking-wider text-black'
                        >
                          {vibe}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className='mt-5 flex items-center gap-3'>
                <button className='font-pt-mono cursor-pointer rounded-sm bg-black px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80 active:scale-95'>
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

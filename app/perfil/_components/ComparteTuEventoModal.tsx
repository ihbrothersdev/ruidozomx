'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

interface ComparteTuEventoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const maxDescripcion = 200
const TIPOS_EVENTO = ['Tocada', 'Convocatoria', 'Fecha disponible']

const inputCls =
  'w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-1.5 font-pt-mono text-sm text-black shadow-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'

const textareaCls =
  'max-w-full rounded-none border-2 border-red-600 bg-transparent px-3 py-1.5 font-pt-mono text-sm text-black shadow-none resize-none placeholder:text-black/30 focus-visible:border-red-800 focus-visible:ring-0'

export default function ComparteTuEventoModal({ open, onOpenChange }: ComparteTuEventoModalProps) {
  const [tipo, setTipo] = useState('')
  const [nombre, setNombre] = useState('')
  const [venue, setVenue] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [direccion, setDireccion] = useState('')
  const [fecha, setFecha] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [links, setLinks] = useState('')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='max-h-[90vh] overflow-y-auto border-none bg-transparent p-0 shadow-none sm:max-w-2xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Comparte tu evento con la comunidad RU!DOZO</DialogTitle>

        <div className='relative'>
          <div className='relative min-h-full'>
            <Image
              src='/assets/membrete-background.png'
              alt=''
              width={600}
              height={800}
              className='absolute inset-0 h-full w-full object-fill'
              unoptimized
            />

            {/* Content */}
            <div className='relative z-10 flex flex-col pt-6 pr-6 pb-6 pl-15 sm:pr-10 sm:pl-28'>
              {/* Title image */}
              <Image
                src='/assets/comparte-evento-title.png'
                alt='Comparte tu evento con la comunidad RU!DOZO'
                width={500}
                height={80}
                className='h-auto w-full max-w-78 sm:max-w-100'
                unoptimized
              />

              {/* Form */}
              <div className='mt-5 w-full space-y-4'>
                {/* Tipo — dropdown */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>Tipo</Label>
                  <Select
                    value={tipo}
                    onValueChange={setTipo}
                  >
                    <SelectTrigger className='font-pt-mono w-full rounded-none border-2 border-red-600 bg-transparent text-sm text-black shadow-none focus-visible:border-red-800 focus-visible:ring-0'>
                      <SelectValue placeholder='Selecciona tipo' />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_EVENTO.map(t => (
                        <SelectItem
                          key={t}
                          value={t}
                        >
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nombre del evento */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                    Nombre del evento
                  </Label>
                  <Input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Lugar */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>Lugar</Label>
                  <div className='space-y-2'>
                    <div className='flex gap-2'>
                      <Input
                        value={venue}
                        onChange={e => setVenue(e.target.value)}
                        placeholder='Nombre del venue'
                        className={inputCls}
                      />
                      <Input
                        value={ciudad}
                        onChange={e => setCiudad(e.target.value)}
                        placeholder='Ciudad'
                        className={inputCls}
                      />
                    </div>
                    <Input
                      value={direccion}
                      onChange={e => setDireccion(e.target.value)}
                      placeholder='Dirección'
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Fecha */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>Fecha</Label>
                  <Input
                    type='date'
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Descripción del evento */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>
                    Descripción del evento
                  </Label>
                  <Textarea
                    value={descripcion}
                    onChange={e => {
                      if (e.target.value.length <= maxDescripcion) setDescripcion(e.target.value)
                    }}
                    rows={5}
                    className={textareaCls}
                  />
                  <p className='font-pt-mono text-right text-[10px] tracking-wider text-black/40'>
                    {descripcion.length}/{maxDescripcion}
                  </p>
                </div>

                {/* Links */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-black uppercase'>Links</Label>
                  <Input
                    value={links}
                    onChange={e => setLinks(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className='mt-6 flex justify-end gap-3'>
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

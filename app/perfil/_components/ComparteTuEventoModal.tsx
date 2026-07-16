'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { sileo } from 'sileo'
import { Calendar } from '@/app/components/ui/calendar'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Label } from '@/app/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { AdminButton } from '@/app/admin/_components/kit'
import { submitEvent, updateEvent } from '../actions'
import type { EventSummary } from './DynamicModules'

interface ComparteTuEventoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When set, the modal edits this published event instead of creating one. */
  event?: EventSummary | null
}

const maxDescripcion = 200
const TIPOS_EVENTO = ['Tocada', 'Convocatoria', 'Fecha disponible']

const inputCls =
  'w-full rounded-none border-2 border-admin-ink bg-admin-paper px-3 py-1.5 font-pt-mono text-sm text-admin-ink shadow-none placeholder:text-admin-ink-faint focus-visible:border-admin-red focus-visible:ring-0'

const textareaCls =
  'max-w-full rounded-none border-2 border-admin-ink bg-admin-paper px-3 py-1.5 font-pt-mono text-sm text-admin-ink shadow-none resize-none placeholder:text-admin-ink-faint focus-visible:border-admin-red focus-visible:ring-0'

export default function ComparteTuEventoModal({ open, onOpenChange, event = null }: ComparteTuEventoModalProps) {
  const isEditing = !!event

  // Prefill from the event being edited. `event_date` is a plain YYYY-MM-DD;
  // append a local-time component so it isn't shifted a day back for viewers
  // west of UTC. In edit mode the parent remounts this via `key`, so these
  // initializers re-run for each event.
  const [tipo, setTipo] = useState(event?.event_type ?? '')
  const [nombre, setNombre] = useState(event?.title ?? '')
  const [venue, setVenue] = useState(event?.venue_name ?? '')
  const [ciudad, setCiudad] = useState(event?.city ?? '')
  const [direccion, setDireccion] = useState(event?.address ?? '')
  const [fecha, setFecha] = useState<Date | undefined>(
    event?.event_date ? new Date(`${event.event_date}T00:00:00`) : undefined
  )
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [descripcion, setDescripcion] = useState(event?.description ?? '')
  const [links, setLinks] = useState(event?.external_link ?? '')
  const [sending, setSending] = useState(false)

  const canSubmit = tipo.trim().length > 0 && nombre.trim().length > 0 && !!fecha

  function resetForm() {
    setTipo('')
    setNombre('')
    setVenue('')
    setCiudad('')
    setDireccion('')
    setFecha(undefined)
    setDescripcion('')
    setLinks('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit || !fecha) return
    setSending(true)
    const payload = {
      type: tipo,
      title: nombre,
      venueName: venue || undefined,
      city: ciudad || undefined,
      address: direccion || undefined,
      date: format(fecha, 'yyyy-MM-dd'),
      description: descripcion || undefined,
      externalLink: links || undefined
    }
    const result = isEditing ? await updateEvent({ id: event.id, ...payload }) : await submitEvent(payload)
    setSending(false)
    if (result.error) {
      sileo.error({ title: 'Error', description: result.error, position: 'top-center', duration: 4000 })
      return
    }
    sileo.success({
      title: '¡Éxito!',
      description: isEditing ? 'Tu evento ha sido actualizado.' : 'Tu evento ha sido publicado.',
      position: 'top-center',
      duration: 4000
    })
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='admin-hard max-h-[90vh] overflow-y-auto border-2 border-admin-ink bg-admin-surface p-0 text-admin-ink sm:max-w-2xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>
          {isEditing ? 'Edita tu evento publicado' : 'Comparte tu evento con la comunidad RU!DOZO'}
        </DialogTitle>

        {/* Content */}
        <div className='flex flex-col p-6 sm:p-8'>
          {/* Title */}
          <h2 className='font-baby-doll text-4xl text-admin-ink'>
            {isEditing ? 'Edita tu evento' : 'Comparte tu evento'}
          </h2>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className='mt-5 w-full space-y-4'
          >
                {/* Tipo — dropdown */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-admin-ink uppercase'>
                    Tipo<span className='text-admin-red'>*</span>
                  </Label>
                  <Select
                    value={tipo}
                    onValueChange={setTipo}
                  >
                    <SelectTrigger className='font-pt-mono w-full rounded-none border-2 border-admin-ink bg-admin-paper text-sm text-admin-ink shadow-none focus-visible:border-admin-red focus-visible:ring-0'>
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
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-admin-ink uppercase'>
                    Nombre del evento<span className='text-admin-red'>*</span>
                  </Label>
                  <Input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>

                {/* Lugar */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-admin-ink uppercase'>Lugar</Label>
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
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-admin-ink uppercase'>
                    Fecha<span className='text-admin-red'>*</span>
                  </Label>
                  <Popover
                    open={calendarOpen}
                    onOpenChange={setCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type='button'
                        className={`${inputCls} flex items-center justify-between text-left ${
                          fecha ? 'text-admin-ink' : 'text-admin-ink-faint'
                        }`}
                      >
                        {fecha ? format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es }) : 'Selecciona una fecha'}
                        <CalendarIcon className='ml-2 size-4 shrink-0 text-admin-red' />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto p-0'
                      align='start'
                    >
                      <Calendar
                        mode='single'
                        selected={fecha}
                        onSelect={next => {
                          setFecha(next)
                          setCalendarOpen(false)
                        }}
                        locale={es}
                        captionLayout='dropdown'
                        defaultMonth={fecha ?? new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Descripción del evento */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-admin-ink uppercase'>
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
                  <p className='font-pt-mono text-right text-[10px] tracking-wider text-admin-ink-faint'>
                    {descripcion.length}/{maxDescripcion}
                  </p>
                </div>

                {/* Links */}
                <div className='space-y-1'>
                  <Label className='font-pt-mono text-sm font-bold tracking-wider text-admin-ink uppercase'>Links</Label>
                  <Input
                    value={links}
                    onChange={e => setLinks(e.target.value)}
                    placeholder='Boletos, Instagram, sitio del evento...'
                    className={inputCls}
                  />
                </div>

                {/* Action buttons */}
                <div className='mt-6 flex justify-end gap-3'>
                  <AdminButton
                    type='submit'
                    variant='solid'
                    disabled={!canSubmit || sending}
                  >
                    {sending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Enviar'}
                  </AdminButton>
                  <AdminButton
                    type='button'
                    variant='primary'
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </AdminButton>
                </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

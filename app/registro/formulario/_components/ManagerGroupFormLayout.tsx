'use client'

import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Textarea } from '@/app/components/ui/textarea'
import { EVENT_TYPE_OPTIONS, TERRITORIAL_REACH_OPTIONS } from '@/lib/types'
import Image from 'next/image'
import { useState } from 'react'
import { Field } from './Field'
import { LocationFields } from './LocationFields'
import { PhotoUpload } from './PhotoUpload'
import { YesNoField } from './YesNoField'
import { inputCls, labelCls, selectTriggerCls } from './form-styles'

type SubRole = 'manager' | 'promotor' | 'agente'

export function ManagerGroupFormLayout({ initialRole = 'manager' }: { initialRole?: SubRole }) {
  const [subRole, setSubRole] = useState<SubRole>(initialRole)
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [otherEvent, setOtherEvent] = useState('')

  function toggleEvent(event: string) {
    setEventTypes(prev => (prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]))
  }

  return (
    <div className='flex flex-col gap-3 md:flex-row md:gap-5'>
      {/* ── Left column ── */}
      <div className='w-full min-w-0 space-y-2 md:w-1/2'>
        <LocationFields />

        <Field
          label='Nombre completo'
          name='full_name'
          required
          placeholder='Tu nombre completo'
        />
        <Field
          label='Link a web o redes'
          name='web_link'
          placeholder='https://...'
        />

        {/* Cuál es tu rol — dropdown */}
        <div className='min-w-0 space-y-0.5'>
          <Label className={labelCls}>
            Cuál es tu rol<span className='text-red-600'>*</span>
          </Label>
          <Select
            name='role_type'
            required
            value={subRole}
            onValueChange={v => setSubRole(v as SubRole)}
          >
            <SelectTrigger className={selectTriggerCls}>
              <SelectValue placeholder='Selecciona tu rol' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='manager'>Manager</SelectItem>
              <SelectItem value='promotor'>Promotor</SelectItem>
              <SelectItem value='agente'>Agente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role-specific left fields */}
        {subRole === 'promotor' && (
          <PromotorLeftFields
            eventTypes={eventTypes}
            otherEvent={otherEvent}
            setOtherEvent={setOtherEvent}
            toggleEvent={toggleEvent}
          />
        )}
        {subRole === 'manager' && <ManagerLeftFields />}
        {subRole === 'agente' && <AgenteLeftFields />}
      </div>

      {/* ── Right column ── */}
      <div className='flex w-full flex-col gap-3 md:w-1/2'>
        <PhotoUpload />

        <div className='space-y-0.5'>
          <Label
            htmlFor='review'
            className={labelCls}
          >
            Reseña<span className='text-red-600'>*</span>
          </Label>
          <Textarea
            id='review'
            name='review'
            required
            placeholder='600 caracteres máximo'
            maxLength={600}
            className={inputCls + ' min-h-[140px] resize-none md:min-h-[180px]'}
          />
        </div>

        {/* Role-specific right fields */}
        {subRole === 'promotor' && <PromotorRightFields />}
        {subRole === 'manager' && <ManagerRightFields />}
        {subRole === 'agente' && <AgenteRightFields />}

        {/* Siguiente */}
        <div className='flex flex-1 items-end justify-end'>
          <button
            type='submit'
            className='cursor-pointer'
          >
            <Image
              src='/assets/registro/formulario/shared/boton-siguiente.png'
              alt='Siguiente'
              width={220}
              height={65}
              className='w-36 transition-opacity hover:opacity-80 sm:w-44'
              style={{ height: 'auto' }}
              unoptimized
            />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Promotor fields ─── */

function PromotorLeftFields({
  eventTypes,
  otherEvent,
  setOtherEvent,
  toggleEvent
}: {
  eventTypes: string[]
  otherEvent: string
  setOtherEvent: (v: string) => void
  toggleEvent: (e: string) => void
}) {
  return (
    <>
      <YesNoField
        label='¿Organizas eventos actualmente?'
        name='organizes_events'
        required
      />

      <div className='space-y-1'>
        <Label className={labelCls}>Alcance territorial</Label>
        {TERRITORIAL_REACH_OPTIONS.map(opt => (
          <div
            key={opt}
            className='flex items-center gap-1.5'
          >
            <Checkbox
              id={`reach-${opt}`}
              name='territorial_reach'
              value={opt}
              className='border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
            />
            <Label
              htmlFor={`reach-${opt}`}
              className='font-pt-mono cursor-pointer text-sm text-black'
            >
              {opt}
            </Label>
          </div>
        ))}
      </div>

      <div className='space-y-1'>
        <Label className={labelCls}>
          Tipos de eventos<span className='text-red-600'>*</span>
        </Label>
        {EVENT_TYPE_OPTIONS.map(event => {
          const isOtro = event === 'Otro'
          return (
            <div key={event}>
              <div className='flex items-center gap-1.5'>
                <Checkbox
                  id={`event-${event}`}
                  name='event_types'
                  value={isOtro && otherEvent ? otherEvent : event}
                  checked={eventTypes.includes(event)}
                  onCheckedChange={() => toggleEvent(event)}
                  className='border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                />
                <Label
                  htmlFor={`event-${event}`}
                  className='font-pt-mono cursor-pointer text-sm text-black'
                >
                  {event}
                </Label>
              </div>
              {isOtro && eventTypes.includes('Otro') && (
                <Input
                  name='event_type_other'
                  value={otherEvent}
                  onChange={e => setOtherEvent(e.target.value)}
                  placeholder='Especifica...'
                  className={inputCls + ' mt-1 ml-6'}
                />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function PromotorRightFields() {
  return (
    <>
      <YesNoField
        label='¿Promocionarás eventos dentro de Ruidozo?'
        name='provide_events_ruidozo'
        required
      />
      <YesNoField
        label='¿Buscas talento?'
        name='seeks_talent'
        required
      />
      <YesNoField
        label='¿Recibes propuesta directas?'
        name='accept_proposals'
        required
      />
      <Field
        label='Contacto'
        name='contact'
        required
        placeholder='Email, teléfono o red social'
      />
    </>
  )
}

/* ─── Manager fields ─── */

function ManagerLeftFields() {
  return (
    <>
      <YesNoField
        label='¿Representas artistas/proyectos?'
        name='represents_artists'
        required
      />
      <Field
        label='Nombre(s) de artistas/proyectos que representas'
        name='artists_represented'
        required
        placeholder='Ej: Banda X, Solista Y...'
      />
      <YesNoField
        label='¿Buscas talento emergente?'
        name='seeks_emerging_talent'
        required
      />
      <YesNoField
        label='¿Recibes propuesta directas?'
        name='accept_proposals'
        required
      />
    </>
  )
}

function ManagerRightFields() {
  return (
    <>
      <YesNoField
        label='¿Promocionarás a tus bandas dentro de Ruidozo?'
        name='promote_bands_ruidozo'
        required
      />
      <Field
        label='Contacto'
        name='contact'
        placeholder='Email, teléfono o red social'
      />
    </>
  )
}

/* ─── Agente fields ─── */

function AgenteLeftFields() {
  return (
    <>
      <YesNoField
        label='¿Representas artistas para tocadas?'
        name='represents_artists_live'
        required
      />

      <div className='space-y-1'>
        <Label className={labelCls}>Alcance territorial</Label>
        {TERRITORIAL_REACH_OPTIONS.map(opt => (
          <div
            key={opt}
            className='flex items-center gap-1.5'
          >
            <Checkbox
              id={`reach-${opt}`}
              name='territorial_reach'
              value={opt}
              className='border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
            />
            <Label
              htmlFor={`reach-${opt}`}
              className='font-pt-mono cursor-pointer text-sm text-black'
            >
              {opt}
            </Label>
          </div>
        ))}
      </div>

      <YesNoField
        label='¿Buscas nuevos proyectos?'
        name='seeks_new_projects'
        required
      />
      <YesNoField
        label='¿Recibes propuesta directas?'
        name='accept_proposals'
        required
      />
    </>
  )
}

function AgenteRightFields() {
  return (
    <>
      <YesNoField
        label='¿Proporcionarás eventos dentro de Ruidozo?'
        name='provide_events_ruidozo'
        required
      />
      <Field
        label='Contacto'
        name='contact'
        placeholder='Email, teléfono o red social'
      />
    </>
  )
}

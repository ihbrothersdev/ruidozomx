'use client'

import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { EVENT_TYPE_OPTIONS, TERRITORIAL_REACH_OPTIONS } from '@/lib/types'
import { useState } from 'react'
import { YesNoField } from './YesNoField'
import { Field } from './Field'
import { inputCls, labelCls } from './form-styles'

export function PromotorFields() {
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [otherEvent, setOtherEvent] = useState('')

  function toggleEvent(event: string) {
    setEventTypes(prev => (prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]))
  }

  return (
    <>
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

      <div className='flex flex-col gap-4 lg:flex-row lg:gap-6'>
        <div className='flex-1 space-y-3'>
          <div className='space-y-0.5'>
            <Label className={labelCls}>Cuál es tu rol</Label>
            <p className='font-pt-mono text-sm font-bold text-black'>Promotor</p>
            <input
              type='hidden'
              name='role_type'
              value='promotor'
            />
          </div>

          <YesNoField
            label='¿Organizas eventos actualmente?'
            name='organizes_events'
            required
          />

          {/* Alcance territorial */}
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

          {/* Tipos de eventos */}
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
            {eventTypes.length === 0 && (
              <input
                type='hidden'
                name='_events_required'
                required
                value=''
              />
            )}
          </div>
        </div>

        <div className='flex-1 space-y-3'>
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
              className={inputCls + ' min-h-[140px] resize-none'}
            />
          </div>

          <YesNoField
            label='¿Proporcionarás eventos dentro de Ruidozo?'
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
        </div>
      </div>
    </>
  )
}

'use client'

import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group'
import { Textarea } from '@/app/components/ui/textarea'
import { CAPACITY_OPTIONS, VENUE_TYPE_OPTIONS } from '@/lib/types'
import Image from 'next/image'
import { Field } from './Field'
import { LocationFields } from './LocationFields'
import { PhotoUpload } from './PhotoUpload'
import { YesNoField } from './YesNoField'
import { inputCls, labelCls } from './form-styles'

export function VenueFormLayout() {
  return (
    <>
    <div className='flex flex-col gap-4 lg:flex-row lg:gap-6'>
      {/* ── Left column ── */}
      <div className='w-full min-w-0 space-y-3 lg:w-1/2'>
        <LocationFields />
        <Field
          label='Nombre del espacio'
          name='venue_name'
          required
        />
        <Field
          label='Link a web o redes'
          name='web_link'
          placeholder='https://...'
        />

        {/* Capacidad — radio single value → VARCHAR(20) in DB */}
        <div className='space-y-1'>
          <Label className={labelCls}>
            Capacidad<span className='text-red-600'>*</span>
          </Label>
          <RadioGroup
            name='capacity'
            required
            className='gap-1.5'
          >
            {CAPACITY_OPTIONS.map(opt => (
              <div
                key={opt}
                className='flex items-center gap-1.5'
              >
                <RadioGroupItem
                  id={`cap-${opt}`}
                  value={opt}
                  className='border-red-600 text-red-600'
                />
                <Label
                  htmlFor={`cap-${opt}`}
                  className='font-pt-mono cursor-pointer text-sm text-black'
                >
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Tipo de venue */}
        <div className='space-y-1'>
          <Label className={labelCls}>Tipo</Label>
          {VENUE_TYPE_OPTIONS.map(opt => (
            <div
              key={opt}
              className='flex items-center gap-1.5'
            >
              <Checkbox
                id={`vtype-${opt}`}
                name='venue_type'
                value={opt}
                className='border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
              />
              <Label
                htmlFor={`vtype-${opt}`}
                className='font-pt-mono cursor-pointer text-sm text-black'
              >
                {opt}
              </Label>
            </div>
          ))}
        </div>

        <YesNoField
          label='¿Cuentas con audio propio?'
          name='has_audio'
        />
        <YesNoField
          label='¿Cuentas con iluminación?'
          name='has_lighting'
        />
      </div>

      {/* ── Right column ── */}
      <div className='order-first flex w-full flex-col gap-4 lg:order-none lg:w-1/2'>
        <PhotoUpload />
        <div className='space-y-0.5'>
          <Label
            htmlFor='description'
            className={labelCls}
          >
            Descripción<span className='text-red-600'>*</span>
          </Label>
          <Textarea
            id='description'
            name='description'
            required
            placeholder='600 caracteres máximo'
            maxLength={600}
            className={inputCls + ' min-h-[160px] resize-none lg:min-h-[200px]'}
          />
        </div>
        <YesNoField
          label='¿Recibes propuestas de la escena independiente?'
          name='accepts_indie_proposals'
          required
        />
        <YesNoField
          label='¿Publicarás convocatorias dentro de Ruidozo?'
          name='publish_calls_ruidozo'
          required
        />
        <Field
          label='Contacto'
          name='contact'
        />
      </div>
    </div>
    <div className='flex justify-end pt-4'>
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
    </>
  )
}

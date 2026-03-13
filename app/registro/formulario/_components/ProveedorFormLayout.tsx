'use client'

import { Checkbox } from '@/app/components/ui/checkbox'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { SERVICE_TYPE_OPTIONS, TERRITORIAL_REACH_OPTIONS } from '@/lib/types'
import Image from 'next/image'
import { useState } from 'react'
import { Field } from './Field'
import { LocationFields } from './LocationFields'
import { PhotoUpload } from './PhotoUpload'
import { YesNoField } from './YesNoField'
import { inputCls, labelCls } from './form-styles'

export function ProveedorFormLayout() {
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [otherService, setOtherService] = useState('')

  function toggleService(service: string) {
    setServiceTypes(prev => (prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]))
  }

  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:gap-6'>
      {/* ── Left column ── */}
      <div className='w-full min-w-0 space-y-3 lg:w-1/2'>
        <LocationFields />
        <Field
          label='Nombre o marca'
          name='brand_name'
          required
          placeholder='Nombre de tu empresa o marca'
        />
        <Field
          label='Link a web o redes (si aplica)'
          name='web_link'
          placeholder='https://...'
        />

        {/* Alcance territorial */}
        <div className='space-y-1'>
          <Label className={labelCls}>
            Alcance territorial<span className='text-red-600'>*</span>
          </Label>
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

        {/* Tipo de servicio */}
        <div className='space-y-1'>
          <Label className={labelCls}>
            Tipo de servicio<span className='text-red-600'>*</span>
            <span className='ml-1 text-[9px] font-normal text-red-500 normal-case'>(Mínimo uno)</span>
          </Label>
          <div className='space-y-1'>
            {SERVICE_TYPE_OPTIONS.map(service => {
              const isOtro = service === 'Otro'
              return (
                <div key={service}>
                  <div className='flex items-center gap-1.5'>
                    <Checkbox
                      id={`service-${service}`}
                      name='service_types'
                      value={isOtro && otherService ? otherService : service}
                      checked={serviceTypes.includes(service)}
                      onCheckedChange={() => toggleService(service)}
                      className='border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                    />
                    <Label
                      htmlFor={`service-${service}`}
                      className='font-pt-mono cursor-pointer text-sm text-black'
                    >
                      {service}
                    </Label>
                  </div>
                  {isOtro && serviceTypes.includes('Otro') && (
                    <Input
                      name='service_type_other'
                      value={otherService}
                      onChange={e => setOtherService(e.target.value)}
                      placeholder='Especifica...'
                      className={inputCls + ' mt-1 ml-6'}
                    />
                  )}
                </div>
              )
            })}
          </div>
          {serviceTypes.length === 0 && (
            <input
              type='hidden'
              name='_services_required'
              required
              value=''
            />
          )}
        </div>

        <YesNoField
          label='¿Trabajas con proyectos emergentes?'
          name='works_emerging_projects'
          required
        />
      </div>

      {/* ── Right column ── */}
      <div className='flex w-full flex-col gap-4 lg:w-1/2'>
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
          label='¿Publicarás tus servicios dentro de Ruidozo?'
          name='publish_services'
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
        />
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

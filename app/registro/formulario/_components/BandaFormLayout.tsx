'use client'

import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Textarea } from '@/app/components/ui/textarea'
import Image from 'next/image'
import { Field } from './Field'
import { LocationFields } from './LocationFields'
import { PhotoUpload } from './PhotoUpload'
import { YesNoField } from './YesNoField'
import { inputCls, labelCls, selectTriggerCls } from './form-styles'

export function BandaFormLayout() {
  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:gap-6'>
      {/* ── Left column: inputs + Si/No fields ── */}
      <div className='w-full min-w-0 space-y-3 lg:w-1/2'>
        <LocationFields />
        <Field
          label='Nombre del proyecto'
          name='band_name'
          required
        />
        <div className='space-y-0.5'>
          <Label
            htmlFor='project_type'
            className={labelCls}
          >
            Tipo de proyecto<span className='text-red-600'>*</span>
          </Label>
          <input type='hidden' name='project_type' value='Banda o Solista' />
          <Select
            defaultValue='Banda o Solista'
            disabled
          >
            <SelectTrigger className={selectTriggerCls + ' opacity-60'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Banda o Solista'>Banda o Solista</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Field
          label='Género principal'
          name='genre'
          required
        />
        <Field
          label='Link a tu proyecto'
          name='project_link'
          required
        />
        <YesNoField
          label='Disponible para tocar en vivo'
          name='available_live'
          required
        />
        <YesNoField
          label='Abierto a colaboraciones'
          name='open_collabs'
          required
        />
        <YesNoField
          label='Disponible para giras'
          name='available_tours'
          required
        />
        <YesNoField
          label='Dispuesto a salir de tu estado/país'
          name='willing_travel'
          required
        />
      </div>

      {/* ── Right column: photo + reseña + Si/No + contacto + siguiente ── */}
      <div className='flex w-full flex-col gap-4 lg:w-1/2'>
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
            placeholder='600 caractéres máximo'
            maxLength={600}
            className={inputCls + ' min-h-[160px] resize-none lg:min-h-[200px]'}
          />
        </div>
        <YesNoField
          label='¿Publicarás fechas dentro de Ru!dozo?'
          name='publish_dates'
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

'use client'

import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Field } from './Field'
import { YesNoField } from './YesNoField'
import { inputCls, labelCls } from './form-styles'

export function ManagerFields() {
  return (
    <>
      <Field
        label='Nombre completo'
        name='full_name'
        required
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
            <p className='font-pt-mono text-sm font-bold text-black'>Manager</p>
            <input
              type='hidden'
              name='role_type'
              value='manager'
            />
          </div>

          <YesNoField
            label='¿Representas artistas/proyectos?'
            name='represents_artists'
            required
          />
          <Field
            label='Nombre(s) de artistas/proyectos que representas'
            name='artists_represented'
            required
          />
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
        </div>
      </div>

      <YesNoField
        label='¿Promocionarás a tus bandas dentro de Ruidozo?'
        name='promote_bands_ruidozo'
        required
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
      <Field
        label='Contacto'
        name='contact'
      />
    </>
  )
}

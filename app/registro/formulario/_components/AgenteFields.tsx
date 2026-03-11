'use client'

import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { TERRITORIAL_REACH_OPTIONS } from '@/lib/types'
import { Field } from './Field'
import { YesNoField } from './YesNoField'
import { inputCls, labelCls } from './form-styles'

export function AgenteFields() {
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
            <Label className={labelCls}>
              Cuál es tu rol
            </Label>
            <p className='font-pt-mono text-sm font-bold text-black'>Agente</p>
            <input type='hidden' name='role_type' value='agente' />
          </div>

          <YesNoField
            label='¿Representas artistas para tocadas?'
            name='represents_artists_live'
            required
          />

          {/* Alcance territorial */}
          <div className='space-y-1'>
            <Label className={labelCls}>
              Alcance territorial
            </Label>
            {TERRITORIAL_REACH_OPTIONS.map(opt => (
              <div key={opt} className='flex items-center gap-1.5'>
                <Checkbox
                  id={`reach-${opt}`}
                  name='territorial_reach'
                  value={opt}
                  className='border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                />
                <Label htmlFor={`reach-${opt}`} className='font-pt-mono cursor-pointer text-sm text-black'>
                  {opt}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className='flex-1 space-y-3'>
          <div className='space-y-0.5'>
            <Label htmlFor='review' className={labelCls}>
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
        label='¿Proporcionarás eventos dentro de Ruidozo?'
        name='provide_events_ruidozo'
        required
      />
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
      <Field
        label='Contacto'
        name='contact'
      />
    </>
  )
}

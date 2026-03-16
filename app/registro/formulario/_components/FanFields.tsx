'use client'

import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'
import { FAN_GENRE_OPTIONS } from '@/lib/types'
import { useState } from 'react'
import { Field } from './Field'
import { YesNoField } from './YesNoField'
import { labelCls } from './form-styles'

export function FanFields() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  function toggleGenre(genre: string) {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre)
      }
      if (prev.length >= 3) return prev
      return [...prev, genre]
    })
  }

  return (
    <>
      <Field
        label='Alias o nombre'
        name='alias'
        required
        placeholder='Tu nombre o alias'
      />

      <div className='space-y-1'>
        <Label className={labelCls}>
          Géneros favoritos<span className='text-red-600'>*</span>
          <span className='ml-1 text-[9px] font-normal text-red-500 normal-case'>(Mín 1 máx 3)</span>
        </Label>
        <div className='grid grid-cols-2 gap-1.5'>
          {FAN_GENRE_OPTIONS.map(genre => {
            const isChecked = selectedGenres.includes(genre)
            const isDisabled = !isChecked && selectedGenres.length >= 3
            return (
              <div
                key={genre}
                className='flex items-center gap-1.5'
              >
                <Checkbox
                  id={`genre-${genre}`}
                  name='favorite_genres'
                  value={genre}
                  checked={isChecked}
                  onCheckedChange={() => toggleGenre(genre)}
                  disabled={isDisabled}
                  className='border-red-600 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600'
                />
                <Label
                  htmlFor={`genre-${genre}`}
                  className='font-pt-mono cursor-pointer text-sm text-black'
                >
                  {genre}
                </Label>
              </div>
            )
          })}
        </div>
        {selectedGenres.length === 0 && (
          <input
            type='hidden'
            name='_genres_required'
            required
            value=''
          />
        )}
      </div>

      <YesNoField
        label='¿Quieres recibir notificaciones de nuevas bandas en tu ciudad?'
        name='notify_new_bands'
        required
      />
      <YesNoField
        label='¿Propondrás a tus bandas favoritas dentro de Ru!dozo?'
        name='propose_fav_bands'
      />
    </>
  )
}

'use client'

import type { FeaturedSongView } from '@/lib/types'

const MAX = 3

interface FeaturedSongsEditorProps {
  candidates: FeaturedSongView[]
  /** Selected `${type}:${id}` keys, in display order. */
  selected: string[]
  onChange: (keys: string[]) => void
}

/**
 * Lets a band pick up to 3 of its rolas (proposals + cassette tracks) to show
 * on its public profile. Rolas with a real MP3 are flagged as playable. The
 * parent serializes `selected` into the `featured_songs` form field on save.
 */
export default function FeaturedSongsEditor({ candidates, selected, onChange }: FeaturedSongsEditorProps) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key))
    } else if (selected.length < MAX) {
      onChange([...selected, key])
    }
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-baseline justify-between gap-3'>
        <p className='font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'>
          Rolas destacadas en tu perfil
        </p>
        <span className='font-pt-mono shrink-0 text-[11px] font-bold tracking-wider text-black/60 uppercase'>
          {selected.length}/{MAX}
        </span>
      </div>

      {candidates.length === 0 ? (
        <div className='font-pt-mono border-2 border-red-700 px-3 py-2 text-xs tracking-wider text-black/60 uppercase'>
          Aún no tienes rolas. Propón una con su MP3 para poder mostrarla aquí.
        </div>
      ) : (
        <ul className='space-y-1.5 border-2 border-red-700 px-3 py-2'>
          {candidates.map(song => {
            const order = selected.indexOf(song.key)
            const isSelected = order !== -1
            const atLimit = selected.length >= MAX
            const disabled = !isSelected && atLimit
            return (
              <li key={song.key}>
                <button
                  type='button'
                  onClick={() => toggle(song.key)}
                  disabled={disabled}
                  className={`flex w-full items-start gap-2 text-left transition-opacity ${
                    disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:opacity-80'
                  }`}
                >
                  <span
                    className={`font-pt-mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-red-600 text-white' : 'border-2 border-red-700 text-transparent'
                    }`}
                  >
                    {isSelected ? order + 1 : '·'}
                  </span>
                  <span className='font-pt-mono flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm'>
                    <span className='font-bold text-black uppercase'>{song.title}</span>
                    <span className='text-xs text-black/60'>— {song.artist}</span>
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        song.isPlayable ? 'bg-green-600/15 text-green-700' : 'bg-black/10 text-black/60'
                      }`}
                    >
                      {song.isPlayable ? '♪ Se escucha' : 'Solo link'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

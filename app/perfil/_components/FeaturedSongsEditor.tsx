'use client'

import { EmptyState, Paper } from '@/app/admin/_components/kit'
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
        <p className='font-pt-mono text-sm font-bold tracking-wider text-admin-red uppercase'>
          Rolas destacadas en tu perfil
        </p>
        <span className='font-pt-mono shrink-0 text-[11px] font-bold tracking-wider text-admin-ink-faint uppercase'>
          {selected.length}/{MAX}
        </span>
      </div>

      {candidates.length === 0 ? (
        <EmptyState>Aún no tienes rolas. Propón una con su MP3 para poder mostrarla aquí.</EmptyState>
      ) : (
        <Paper flat className='px-3 py-2'>
          <ul className='space-y-1.5'>
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
                      className={`font-pt-mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-admin-ink text-[10px] font-bold ${
                        isSelected ? 'bg-admin-red text-admin-surface' : 'text-transparent'
                      }`}
                    >
                      {isSelected ? order + 1 : '·'}
                    </span>
                    <span className='font-pt-mono flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm'>
                      <span className='font-bold text-admin-ink uppercase'>{song.title}</span>
                      <span className='text-xs text-admin-ink-soft'>— {song.artist}</span>
                      <span
                        className={`font-pt-mono ml-auto border-2 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          song.isPlayable
                            ? 'border-admin-olive bg-admin-olive/12 text-admin-olive'
                            : 'border-admin-ink bg-admin-surface text-admin-ink-faint'
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
        </Paper>
      )}
    </div>
  )
}

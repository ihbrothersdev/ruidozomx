'use client'

import { deleteSongProposal } from '@/app/perfil/actions'
import { PROPOSAL_SLOTS, slotsFullMessage } from '@/lib/supabase/proposals'
import type { FeaturedSongView } from '@/lib/types'
import { Music2, Star, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import ConfirmActionModal from './ConfirmActionModal'

interface FeaturedSongsEditorProps {
  /** The band's rolas as shown publicly: live proposals first, then cassette tracks. */
  songs: FeaturedSongView[]
}

/**
 * The band's "Dale play" as seen from edit mode. The list isn't picked anymore —
 * it's whatever the band has proposed — so the only action here is freeing a
 * slot. Rolas already on a cassette are locked: they cost no slot and pulling
 * one would leave a hole in a published tracklist.
 */
export default function FeaturedSongsEditor({ songs }: FeaturedSongsEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingDelete, setPendingDelete] = useState<FeaturedSongView | null>(null)
  const [error, setError] = useState<string | null>(null)

  const live = songs.filter(s => !s.accepted)
  const used = live.length
  const atLimit = used >= PROPOSAL_SLOTS
  const overLimit = used > PROPOSAL_SLOTS

  function confirmDelete() {
    const target = pendingDelete
    if (!target) return
    setError(null)
    startTransition(async () => {
      const result = await deleteSongProposal({ id: target.id })
      if (result?.error) {
        setError(result.error)
      } else {
        setPendingDelete(null)
        router.refresh()
      }
    })
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-baseline justify-between gap-3'>
        <p className='font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'>Rolas en tu perfil</p>
        <span
          className={`font-pt-mono shrink-0 text-[11px] font-bold tracking-wider uppercase ${
            overLimit ? 'text-red-700' : 'text-black/60'
          }`}
        >
          {overLimit ? `${used} rolas · máximo ${PROPOSAL_SLOTS}` : `${used}/${PROPOSAL_SLOTS} espacios`}
        </span>
      </div>

      {songs.length === 0 ? (
        <div className='font-pt-mono border-2 border-red-700 px-3 py-2 text-xs tracking-wider text-black/60 uppercase'>
          Aún no tienes rolas. Propón una para que aparezca aquí.
        </div>
      ) : (
        <ul className='space-y-1.5 border-2 border-red-700 px-3 py-2'>
          {songs.map(song => (
            <li
              key={song.key}
              className='font-pt-mono flex items-start gap-2 text-sm'
            >
              <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' />

              <span className='flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                <span className='font-bold text-black uppercase'>{song.title}</span>
                <span className='text-xs text-black/60'>— {song.artist}</span>
                <span
                  className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                    song.accepted
                      ? 'bg-red-600/15 text-red-700'
                      : song.isPlayable
                        ? 'bg-green-600/15 text-green-700'
                        : 'bg-black/10 text-black/60'
                  }`}
                >
                  {song.accepted ? (
                    <>
                      <Star
                        className='h-2.5 w-2.5 shrink-0'
                        fill='currentColor'
                        strokeWidth={0}
                      />
                      En cassette
                    </>
                  ) : song.isPlayable ? (
                    <>
                      <Music2
                        className='h-2.5 w-2.5 shrink-0'
                        strokeWidth={2.5}
                      />
                      Se escucha
                    </>
                  ) : (
                    'Solo link'
                  )}
                </span>
              </span>

              {song.accepted ? (
                <span className='w-7 shrink-0' />
              ) : (
                <button
                  type='button'
                  onClick={() => setPendingDelete(song)}
                  disabled={isPending}
                  aria-label={`Quitar ${song.title}`}
                  className='shrink-0 cursor-pointer p-1 text-black/40 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className={`font-pt-mono text-[11px] tracking-wider ${overLimit ? 'text-red-700' : 'text-black/60'}`}>
        {atLimit
          ? slotsFullMessage(used, true)
          : `Puedes proponer ${PROPOSAL_SLOTS - used} rola${PROPOSAL_SLOTS - used === 1 ? '' : 's'} más.`}{' '}
        {overLimit && `En tu perfil público solo se ven las primeras ${PROPOSAL_SLOTS}. `}
        Las que salen en un cassette se quedan en tu perfil y no ocupan espacio.
      </p>

      {error && <p className='font-pt-mono text-xs tracking-wider text-red-700'>{error}</p>}

      <ConfirmActionModal
        open={pendingDelete !== null}
        onOpenChange={open => !open && setPendingDelete(null)}
        title='Quitar rola'
        message={
          pendingDelete
            ? `"${pendingDelete.title}" desaparecerá de tu perfil y liberará un espacio. Si sigue en revisión, se retira de la convocatoria.`
            : ''
        }
        confirmLabel='Quitar'
        variant='destructive'
        isPending={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

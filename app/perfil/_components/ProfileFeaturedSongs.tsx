'use client'

import { usePlaybackContextId, usePlayerActions, usePlayerState } from '@/app/hooks/usePlayerStore'
import { deleteSongProposal } from '@/app/perfil/actions'
import { PROPOSAL_SLOTS, slotsFullMessage } from '@/lib/supabase/proposals'
import type { FeaturedSongView, PlayerSong, ProposalStatus } from '@/lib/types'
import { Pause, Play, Star, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import ConfirmActionModal from './ConfirmActionModal'

// Owner-only, and this component also renders on every public profile — keep
// the edit modal and the uploader out of the visitor's bundle.
const ProponerRolaBandaModal = dynamic(() => import('./ProponerRolaBandaModal'))
const ProposedSongAudioUpload = dynamic(() => import('./ProposedSongAudioUpload'))

const STATUS_LABEL: Record<ProposalStatus, { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'bg-black/10 text-black/70' },
  in_review: { label: 'En revisión', cls: 'bg-black/10 text-black/70' },
  accepted: { label: 'Aceptada', cls: 'bg-green-600/15 text-green-700' },
  rejected: { label: 'No incluida', cls: 'bg-red-600/15 text-red-700' }
}

interface ProfileFeaturedSongsProps {
  songs: FeaturedSongView[]
  profileId: string
  /**
   * Owner view: lists every live rola (not just the 3 that go public) and hangs
   * the management affordances off each row — status, "+ MP3", editar, quitar.
   */
  manageable?: boolean
}

/**
 * The band's rolas — the single block for them. Playable tracks (real MP3)
 * stream through the GLOBAL player engine, so pressing play takes over the
 * persistent bar (pausing the cassette) and keeps playing as the user navigates,
 * giving bands that aren't on the cassette a real stage. Link-only rolas fall
 * back to their external link.
 *
 * Publicly this shows at most 3 live proposals plus every cassette rola: bands
 * grandfathered above the cap (one sits at 17) would otherwise turn it into a
 * wall. The owner sees all of them, since that's where they delete from.
 */
export default function ProfileFeaturedSongs({ songs, profileId, manageable = false }: ProfileFeaturedSongsProps) {
  const router = useRouter()
  const { currentSongId, isPlaying } = usePlayerState()
  const { loadContext, play, pause, playSong } = usePlayerActions()
  const contextId = `profile:${profileId}`
  const isActiveContext = usePlaybackContextId() === contextId

  const [editing, setEditing] = useState<FeaturedSongView | null>(null)
  const [pendingDelete, setPendingDelete] = useState<FeaturedSongView | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // `songs` already arrives live-first, so slicing keeps the intended order.
  const shown = useMemo(() => {
    const live = songs.filter(s => !s.accepted)
    const accepted = songs.filter(s => s.accepted)
    return [...(manageable ? live : live.slice(0, PROPOSAL_SLOTS)), ...accepted]
  }, [songs, manageable])

  const playlist = useMemo<PlayerSong[]>(
    () =>
      shown
        .filter(s => s.isPlayable && s.audioUrl)
        .map((s, i) => ({
          id: s.key,
          title: s.title,
          artist: s.artist,
          side: 'A',
          position: i + 1,
          durationSeconds: 0,
          audioSrc: s.audioUrl as string
        })),
    [shown]
  )

  const used = songs.filter(s => !s.accepted).length

  if (shown.length === 0) return null

  function handlePlay(key: string) {
    if (currentSongId === key) {
      if (isPlaying) pause()
      else play()
      return
    }
    if (isActiveContext) {
      playSong(key)
    } else {
      loadContext({
        contextId,
        songs: playlist,
        cassetteId: null,
        concatAudioUrl: null,
        cassetteActive: false,
        initialSongId: key,
        autoPlay: true,
        loop: true
      })
    }
  }

  function confirmDelete() {
    const target = pendingDelete
    if (!target) return
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteSongProposal({ id: target.id })
      if (result?.error) {
        setDeleteError(result.error)
      } else {
        setPendingDelete(null)
        router.refresh()
      }
    })
  }

  return (
    <div className='w-full space-y-2'>
      <div className='flex items-baseline justify-between gap-3'>
        <p className='font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'>Dale play</p>
        {manageable && (
          <span
            className={`font-pt-mono shrink-0 text-[11px] font-bold tracking-wider uppercase ${
              used > PROPOSAL_SLOTS ? 'text-red-700' : 'text-black/60'
            }`}
          >
            {used > PROPOSAL_SLOTS ? `${used} rolas · máximo ${PROPOSAL_SLOTS}` : `${used}/${PROPOSAL_SLOTS} espacios`}
          </span>
        )}
      </div>

      <ul className='space-y-1.5 border-2 border-red-700 px-3 py-2'>
        {shown.map(song => {
          const isThisPlaying = currentSongId === song.key && isPlaying
          const status = song.status ? STATUS_LABEL[song.status] : null
          return (
            <li
              key={song.key}
              className='flex items-center gap-2.5 text-sm'
            >
              {song.isPlayable ? (
                <button
                  type='button'
                  onClick={() => handlePlay(song.key)}
                  aria-label={isThisPlaying ? `Pausar ${song.title}` : `Reproducir ${song.title}`}
                  className='flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700'
                >
                  {isThisPlaying ? (
                    <Pause
                      className='h-3.5 w-3.5'
                      fill='currentColor'
                    />
                  ) : (
                    <Play
                      className='h-3.5 w-3.5 translate-x-[1px]'
                      fill='currentColor'
                    />
                  )}
                </button>
              ) : (
                <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' />
              )}

              <div className='font-pt-mono flex min-w-0 flex-1 items-baseline gap-2.5'>
                <span className='min-w-0 flex-1 truncate'>
                  <span className='font-bold text-black uppercase'>{song.title}</span>
                  <span className='text-xs text-black/60'> — {song.artist}</span>
                </span>

                {song.accepted && (
                  <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700 uppercase'>
                    <Star
                      className='h-2.5 w-2.5 shrink-0'
                      fill='currentColor'
                      strokeWidth={0}
                    />
                    En cassette
                  </span>
                )}

                {manageable && !song.accepted && status && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase ${status.cls}`}
                  >
                    {status.label}
                  </span>
                )}

                {!song.isPlayable && song.externalLink && (
                  <a
                    href={song.externalLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='shrink-0 text-xs font-bold tracking-wider text-red-600 uppercase underline underline-offset-2 hover:text-red-700'
                  >
                    Escuchar ↗
                  </a>
                )}
              </div>

              {manageable && !song.accepted && (
                <div className='flex shrink-0 items-center gap-1.5'>
                  {!song.hasAudio && <ProposedSongAudioUpload proposalId={song.id} />}
                  <button
                    type='button'
                    onClick={() => setEditing(song)}
                    className='font-pt-mono cursor-pointer text-[10px] font-bold tracking-wider text-red-700 uppercase underline transition-opacity hover:opacity-70'
                  >
                    Editar
                  </button>
                  <button
                    type='button'
                    onClick={() => setPendingDelete(song)}
                    disabled={isPending}
                    aria-label={`Quitar ${song.title}`}
                    className='cursor-pointer p-1 text-black/40 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {manageable && (
        <p
          className={`font-pt-mono text-[11px] tracking-wider ${used > PROPOSAL_SLOTS ? 'text-red-700' : 'text-black/60'}`}
        >
          {used >= PROPOSAL_SLOTS
            ? slotsFullMessage(used, true)
            : `Puedes proponer ${PROPOSAL_SLOTS - used} rola${PROPOSAL_SLOTS - used === 1 ? '' : 's'} más.`}{' '}
          {used > PROPOSAL_SLOTS && `En tu perfil público solo se ven las primeras ${PROPOSAL_SLOTS}. `}
          Las que salen en un cassette se quedan en tu perfil y no ocupan espacio.
        </p>
      )}

      {deleteError && <p className='font-pt-mono text-xs tracking-wider text-red-700'>{deleteError}</p>}

      {editing && (
        <ProponerRolaBandaModal
          key={editing.id}
          open
          onOpenChange={open => {
            if (!open) setEditing(null)
          }}
          bandName=''
          showVibes={false}
          proposalId={editing.id}
          initialTitle={editing.title}
          initialArtist={editing.artist}
          initialListenLink={editing.externalLink ?? ''}
          initialDownloadLink={editing.downloadLink ?? ''}
          initialHasAudio={editing.hasAudio}
        />
      )}

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

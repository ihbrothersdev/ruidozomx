'use client'

import { LabelTag, Paper } from '@/app/admin/_components/kit'
import { usePlaybackContextId, usePlayerActions, usePlayerState } from '@/app/hooks/usePlayerStore'
import type { FeaturedSongView, PlayerSong } from '@/lib/types'
import { Pause, Play } from 'lucide-react'
import { useMemo } from 'react'

/**
 * Public profile block: the band's curated rolas. Playable tracks (real MP3)
 * stream through the GLOBAL player engine — pressing play takes over the
 * persistent bar (pausing the cassette) and keeps playing as the user navigates,
 * giving bands that aren't on the cassette a real stage. Link-only rolas fall
 * back to their external link.
 */
export default function ProfileFeaturedSongs({ songs, profileId }: { songs: FeaturedSongView[]; profileId: string }) {
  const { currentSongId, isPlaying } = usePlayerState()
  const { loadContext, play, pause, playSong } = usePlayerActions()
  const contextId = `profile:${profileId}`
  const isActiveContext = usePlaybackContextId() === contextId

  // The playable subset becomes this profile's playlist for the global engine.
  // The featured key (`type:id`) is the song id — it never collides with the
  // cassette's raw uuids, so `currentSongId === key` reliably means "this rola".
  const playlist = useMemo<PlayerSong[]>(
    () =>
      songs
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
    [songs]
  )

  if (songs.length === 0) return null

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

  return (
    <div className='w-full space-y-2'>
      <LabelTag tone='red'>Dale play</LabelTag>

      <Paper
        tone='red'
        className='space-y-1.5 px-3 py-2.5'
      >
        <ul className='space-y-1.5'>
          {songs.map(song => {
            const isThisPlaying = currentSongId === song.key && isPlaying
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
                    className='admin-press flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-2 border-admin-ink bg-admin-red text-admin-surface'
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
                  <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-admin-red' />
                )}

                <div className='font-pt-mono flex min-w-0 flex-1 items-baseline gap-2.5'>
                  <span className='min-w-0 flex-1 truncate'>
                    <span className='font-bold text-admin-ink uppercase'>{song.title}</span>
                    <span className='text-xs text-admin-ink-faint'> — {song.artist}</span>
                  </span>
                  {!song.isPlayable && song.externalLink && (
                    <a
                      href={song.externalLink}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='shrink-0 text-xs font-bold tracking-wider text-admin-red uppercase underline underline-offset-2 hover:text-admin-red/70'
                    >
                      Escuchar ↗
                    </a>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Paper>
    </div>
  )
}

'use client'

import type { FeaturedSongView } from '@/lib/types'
import { Pause, Play } from 'lucide-react'
import { useRef, useState } from 'react'

/**
 * Public profile block: the band's curated rolas. Tracks with a real MP3 play
 * inline (one at a time via a single shared <audio>); the rest fall back to
 * their external link.
 */
export default function ProfileFeaturedSongs({ songs }: { songs: FeaturedSongView[] }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playingKey, setPlayingKey] = useState<string | null>(null)

  if (songs.length === 0) return null

  function togglePlay(song: FeaturedSongView) {
    const audio = audioRef.current
    if (!audio || !song.audioUrl) return
    if (playingKey === song.key) {
      audio.pause()
      setPlayingKey(null)
      return
    }
    // Only (re)load the source when switching tracks — re-assigning the same
    // `src` would reset currentTime to 0, so resuming the same rola continues
    // from where it was paused.
    if (audio.dataset.key !== song.key) {
      audio.src = song.audioUrl
      audio.dataset.key = song.key
    }
    void audio
      .play()
      .then(() => setPlayingKey(song.key))
      .catch(() => setPlayingKey(null))
  }

  return (
    <div className='w-full space-y-2'>
      <p className='font-pt-mono text-sm font-bold tracking-wider text-red-700 uppercase'>Sus rolas</p>

      <ul className='space-y-1.5 border-2 border-red-700 px-3 py-2'>
        {songs.map(song => {
          const isPlaying = playingKey === song.key
          return (
            <li
              key={song.key}
              className='flex items-center gap-2.5 text-sm'
            >
              {song.isPlayable ? (
                <button
                  type='button'
                  onClick={() => togglePlay(song)}
                  aria-label={isPlaying ? `Pausar ${song.title}` : `Reproducir ${song.title}`}
                  className='flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700'
                >
                  {isPlaying ? (
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

              <div className='font-pt-mono flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                <span className='font-bold text-black uppercase'>{song.title}</span>
                <span className='text-xs text-black/60'>— {song.artist}</span>
                {!song.isPlayable && song.externalLink && (
                  <a
                    href={song.externalLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='ml-auto text-xs font-bold tracking-wider text-red-600 uppercase underline underline-offset-2 hover:text-red-700'
                  >
                    Escuchar ↗
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <audio
        ref={audioRef}
        onEnded={e => {
          // Clear the loaded-track marker so pressing play again restarts it.
          e.currentTarget.dataset.key = ''
          setPlayingKey(null)
        }}
        hidden
      />
    </div>
  )
}

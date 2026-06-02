'use client'

import { Music2 } from 'lucide-react'

/** Clean Drive card — Drive's embedded preview is unreliable, so we show a styled link that opens the file in a new tab */
function DriveEmbed({ fileId }: { fileId: string }) {
  return (
    <a
      href={`https://drive.google.com/file/d/${fileId}/view`}
      target='_blank'
      rel='noopener noreferrer'
      className='group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 transition-all hover:border-white/20 hover:bg-white/[0.06]'
    >
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-inset ring-amber-500/20'>
        <Music2 className='h-4 w-4 text-amber-300' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='font-pt-mono text-sm font-bold text-white'>Audio en Drive</p>
        <p className='font-pt-mono text-[10px] tracking-wide text-white/40'>Abrir y reproducir ↗</p>
      </div>
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60'
      >
        <path d='M7 17L17 7M9 7h8v8' />
      </svg>
    </a>
  )
}

/** Wrap an iframe in a dark, clipped container so service-rendered corners blend with the card */
function EmbedFrame({
  height,
  src,
  allow,
  allowFullScreen,
  sandbox
}: {
  height: number
  src: string
  allow?: string
  allowFullScreen?: boolean
  sandbox?: string
}) {
  return (
    <div
      className='overflow-hidden rounded-xl bg-neutral-900'
      style={{ height }}
    >
      <iframe
        src={src}
        allow={allow}
        allowFullScreen={allowFullScreen}
        sandbox={sandbox}
        className='block h-full w-full'
        style={{ border: 0 }}
      />
    </div>
  )
}

/** Detect platform and return an embeddable iframe player.
 * Prefers external_link, but falls back to audio_file_path when the external_link
 * has no embedder (e.g. smart links like onerpm.link). */
export function ProposalEmbed({ externalLink, audioFilePath }: { externalLink?: string; audioFilePath?: string }) {
  return tryEmbed(externalLink) ?? tryEmbed(audioFilePath)
}

function tryEmbed(url?: string | null): React.ReactNode | null {
  if (!url) return null

  // YouTube (watch, shorts, youtu.be)
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]+)/)
  if (ytMatch) {
    return (
      <EmbedFrame
        height={175}
        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope'
        allowFullScreen
      />
    )
  }

  // Spotify track (with optional intl-XX prefix)
  const spotifyMatch = url.match(/open\.spotify\.com\/(?:intl-\w+\/)?track\/(\w+)/)
  if (spotifyMatch) {
    return (
      <EmbedFrame
        height={152}
        src={`https://open.spotify.com/embed/track/${spotifyMatch[1]}?theme=0`}
        allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
      />
    )
  }

  // Spotify album (with optional intl-XX prefix)
  const spotifyAlbumMatch = url.match(/open\.spotify\.com\/(?:intl-\w+\/)?album\/(\w+)/)
  if (spotifyAlbumMatch) {
    return (
      <EmbedFrame
        height={152}
        src={`https://open.spotify.com/embed/album/${spotifyAlbumMatch[1]}?theme=0`}
        allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
      />
    )
  }

  // Spotify playlist
  const spotifyPlaylistMatch = url.match(/open\.spotify\.com\/(?:intl-\w+\/)?playlist\/(\w+)/)
  if (spotifyPlaylistMatch) {
    return (
      <EmbedFrame
        height={152}
        src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistMatch[1]}?theme=0`}
        allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
      />
    )
  }

  // Google Drive (audio/video files)
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/)
  if (driveMatch) {
    return <DriveEmbed fileId={driveMatch[1]} />
  }

  // Apple Music — extract album ID and optional track param
  const appleMatch = url.match(/music\.apple\.com\/(\w+)\/album\/[^/]+\/(\d+)(?:\?i=(\d+))?/)
  if (appleMatch) {
    const country = appleMatch[1]
    const albumId = appleMatch[2]
    const trackId = appleMatch[3]
    const embedUrl = trackId
      ? `https://embed.music.apple.com/${country}/album/${albumId}?i=${trackId}`
      : `https://embed.music.apple.com/${country}/album/${albumId}`
    return (
      <EmbedFrame
        height={175}
        src={embedUrl}
        allow='autoplay *; encrypted-media *; fullscreen *; clipboard-write'
        sandbox='allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation'
      />
    )
  }

  // SoundCloud — require at least user/track or user/sets/playlist (skip bare profiles)
  if (/soundcloud\.com\/[\w-]+\/[\w-]+/.test(url)) {
    return (
      <EmbedFrame
        height={80}
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23e11d48&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`}
        allow='autoplay'
      />
    )
  }

  // Bandcamp
  if (url.includes('bandcamp.com')) {
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='font-pt-mono inline-flex items-center gap-1.5 rounded-sm bg-[#1da0c3]/10 px-3 py-2 text-xs font-bold text-[#1da0c3] transition-colors hover:bg-[#1da0c3]/20'
      >
        <span>▶</span> Escuchar en Bandcamp ↗
      </a>
    )
  }

  // No iframe embed available — InlinePlayer will handle mp3/Drive/Dropbox
  return null
}

/** Check if a URL has an iframe embed (used by InlinePlayer to avoid duplicates) */
export function hasEmbed(url: string): boolean {
  if (/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/.test(url)) return true
  if (/open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist)\//.test(url)) return true
  if (/music\.apple\.com\/\w+\/album\//.test(url)) return true
  if (/soundcloud\.com\/[\w-]+\/[\w-]+/.test(url)) return true
  if (url.includes('bandcamp.com')) return true
  if (/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)/.test(url)) return true
  return false
}

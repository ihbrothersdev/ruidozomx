'use client'

/** Detect platform and return an embeddable iframe player */
export function ProposalEmbed({ externalLink, audioFilePath }: { externalLink?: string; audioFilePath?: string }) {
  const url = externalLink || audioFilePath
  if (!url) return null

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (ytMatch) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
        className='h-[175px] w-full rounded-lg'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope'
        allowFullScreen
      />
    )
  }

  // Spotify track
  const spotifyMatch = url.match(/open\.spotify\.com\/track\/([\w]+)/)
  if (spotifyMatch) {
    return (
      <iframe
        src={`https://open.spotify.com/embed/track/${spotifyMatch[1]}?theme=0`}
        className='h-[175px] w-full rounded-lg'
        allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
      />
    )
  }

  // Spotify album
  const spotifyAlbumMatch = url.match(/open\.spotify\.com\/album\/([\w]+)/)
  if (spotifyAlbumMatch) {
    return (
      <iframe
        src={`https://open.spotify.com/embed/album/${spotifyAlbumMatch[1]}?theme=0`}
        className='h-[175px] w-full rounded-lg'
        allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
      />
    )
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
      <iframe
        src={embedUrl}
        className='h-[175px] w-full overflow-hidden rounded-lg'
        allow='autoplay *; encrypted-media *; fullscreen *; clipboard-write'
        sandbox='allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation'
        style={{ border: 0 }}
      />
    )
  }

  // SoundCloud
  if (url.includes('soundcloud.com')) {
    return (
      <iframe
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23e11d48&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`}
        className='h-20 w-full rounded-sm'
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
  if (/(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url)) return true
  if (/open\.spotify\.com\/(track|album)\//.test(url)) return true
  if (/music\.apple\.com\/\w+\/album\//.test(url)) return true
  if (url.includes('soundcloud.com')) return true
  if (url.includes('bandcamp.com')) return true
  return false
}

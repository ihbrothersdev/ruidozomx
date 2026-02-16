import type { Song, PlayerState } from '@/lib/types'
import { Cassette } from './Cassette'
import { DialogBubble } from './DialogBubble'
import { PlayingArrow } from './PlayingArrow'

interface CassettePlayerProps {
  songs: Song[]
  playerState: PlayerState
}

export function CassettePlayer({ songs, playerState }: CassettePlayerProps) {
  const currentSong = songs.find(s => s.id === playerState.currentSongId)

  return (
    <div
      className='relative mx-auto w-full'
      style={{ maxWidth: 793 }}
    >
      <div className='relative'>
        <Cassette
          songTitle={currentSong?.title ?? ''}
          artist={currentSong?.artist ?? ''}
          date={playerState.date}
          side={playerState.currentSide}
        />
        <PlayingArrow />
        <DialogBubble />
      </div>
    </div>
  )
}

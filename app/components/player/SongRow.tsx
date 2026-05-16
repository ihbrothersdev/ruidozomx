import type { PlayerSong } from '@/lib/types'
import { NowPlayingBars } from './NowPlayingBars'

interface SongRowProps {
  index: number
  sides: Record<'A' | 'B', PlayerSong[]>
  currentSongId: string
  isPlaying?: boolean
  onSelectSong?: (id: string) => void
}

export function SongRow({ index, sides, currentSongId, isPlaying = false, onSelectSong }: SongRowProps) {
  return (['A', 'B'] as const).map(side => {
    const song = sides[side][index]
    const isActive = song?.id === currentSongId
    return (
      <div
        key={`${side}-${index}`}
        className='flex min-w-0 items-end overflow-hidden'
      >
        {song && (
          <button
            type='button'
            className={`font-corose flex w-full min-w-0 cursor-pointer items-end pb-[2px] text-left leading-none ${
              isActive ? 'text-orange-600' : 'text-gray-800 hover:text-orange-500'
            }`}
            style={{ fontSize: 'clamp(9px, 1.4vw, 14px)' }}
            onClick={() => onSelectSong?.(song.id)}
          >
            {isActive && isPlaying && <NowPlayingBars className='h-3' />}
            <span className='font-corose-alt shrink-0 text-[16px] font-bold'>
              {index + 1}. {song.title}
            </span>
            <span className='font-corose min-w-0 truncate text-[13px]'> - {song.artist}</span>
          </button>
        )}
      </div>
    )
  })
}

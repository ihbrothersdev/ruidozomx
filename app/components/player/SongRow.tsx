import type { Song } from '@/lib/types'

interface SongRowProps {
  index: number
  sides: Record<'A' | 'B', Song[]>
  currentSongId: number
  onSelectSong?: (id: number) => void
}

export function SongRow({ index, sides, currentSongId, onSelectSong }: SongRowProps) {
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
            {isActive && <span className='mr-0.5 shrink-0'>&#9654;</span>}
            <span className='shrink-0 text-[16px] font-corose-alt font-bold'>
              {index + 1}. {song.title}
            </span>
            <span className='min-w-0 truncate text-[13px] font-corose'>
              {' '}- {song.artist}
            </span>
          </button>
        )}
      </div>
    )
  })
}

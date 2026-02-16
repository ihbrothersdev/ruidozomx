export interface Song {
  id: number
  title: string
  artist: string
  side: 'A' | 'B'
  position: number
  durationSeconds: number
}

export interface PlayerState {
  currentSongId: number
  currentSide: 'A' | 'B'
  elapsedSeconds: number
  isPlaying: boolean
  date: string
}
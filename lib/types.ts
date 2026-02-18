export interface Song {
  id: number
  title: string
  artist: string
  side: 'A' | 'B'
  position: number
  durationSeconds: number
  audioSrc: string
}

export interface PlayerState {
  currentSongId: number
  currentSide: 'A' | 'B'
  elapsedSeconds: number
  isPlaying: boolean
  date: string
}
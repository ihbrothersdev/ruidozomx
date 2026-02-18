import { PlayerState, Song } from './types'

export const MOCK_SONGS: Song[] = [
  { id: 1, title: 'Noche Eterna', artist: 'Los Rituales', side: 'A', position: 1, durationSeconds: 214, audioSrc: '/audio/noche-eterna.wav' },
  { id: 2, title: 'Cemento y Sal', artist: 'Derrumbe', side: 'A', position: 2, durationSeconds: 187, audioSrc: '/audio/noche-eterna.wav' },
  { id: 3, title: 'Todavía DF', artist: 'Belafonte Sensacional', side: 'A', position: 3, durationSeconds: 243, audioSrc: '/audio/noche-eterna.wav' },
  { id: 4, title: 'Ruido Blanco', artist: 'Estática', side: 'A', position: 4, durationSeconds: 196, audioSrc: '/audio/noche-eterna.wav' },
  { id: 5, title: 'Calle Sin Nombre', artist: 'Asfalto Rojo', side: 'A', position: 5, durationSeconds: 228, audioSrc: '/audio/noche-eterna.wav' },
  { id: 6, title: 'Frecuencia Perdida', artist: 'Señal Rota', side: 'B', position: 1, durationSeconds: 201, audioSrc: '/audio/noche-eterna.wav' },
  { id: 7, title: 'Hierro y Fuego', artist: 'Cráter', side: 'B', position: 2, durationSeconds: 176, audioSrc: '/audio/noche-eterna.wav' },
  { id: 8, title: 'Eco de Otros Días', artist: 'Bruma', side: 'B', position: 3, durationSeconds: 256, audioSrc: '/audio/noche-eterna.wav' },
  { id: 9, title: 'Voltaje', artist: 'Circuito Muerto', side: 'B', position: 4, durationSeconds: 192, audioSrc: '/audio/noche-eterna.wav' },
  { id: 10, title: 'Última Transmisión', artist: 'Ruidozo', side: 'B', position: 5, durationSeconds: 234, audioSrc: '/audio/noche-eterna.wav' },
]

export const MOCK_PLAYER_STATE: PlayerState = {
  currentSongId: 3,
  currentSide: 'A',
  elapsedSeconds: 136,
  isPlaying: true,
  date: 'MAR. 20/26'
}

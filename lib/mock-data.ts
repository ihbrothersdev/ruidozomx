import { PlayerState, PlayerSong } from './types'

export const MOCK_SONGS: PlayerSong[] = [
  // Side A
  {
    id: 'a01',
    title: 'Susana',
    artist: 'Andy Mountains Paulimorfa Alexis Ulises',
    side: 'A',
    position: 1,
    durationSeconds: 239,
    audioSrc: '/songs/ANDY MOUNTAINS PAULIMORFA ALEXIS ULISES Susana.mp3'
  },
  {
    id: 'a02',
    title: 'Todavía DF',
    artist: 'Belafonte Sensacional',
    side: 'A',
    position: 2,
    durationSeconds: 191,
    audioSrc: '/songs/BELAFONTE SENSACIONAL_Todavia DF.mp3'
  },
  {
    id: 'a03',
    title: 'Paso a Paso',
    artist: 'Boyler',
    side: 'A',
    position: 3,
    durationSeconds: 189,
    audioSrc: '/songs/BOYLER-Paso a paso.mp3'
  },
  {
    id: 'a04',
    title: 'Charlie Contra los Monjes',
    artist: 'Cacomixtle',
    side: 'A',
    position: 4,
    durationSeconds: 192,
    audioSrc: '/songs/CACOMIXTLE_charlie contra los monjes.mp3'
  },
  {
    id: 'a05',
    title: 'Morir Es Solo Despertar',
    artist: 'Caminatas Nocturnas',
    side: 'A',
    position: 5,
    durationSeconds: 200,
    audioSrc: '/songs/CAMINATAS NOCTURNAS_Morir es solo despertar.mp3'
  },
  {
    id: 'a06',
    title: 'Mi Corset',
    artist: 'Carrion Kids',
    side: 'A',
    position: 6,
    durationSeconds: 205,
    audioSrc: '/songs/CARRION KIDS_Mi Corset.mp3'
  },
  {
    id: 'a07',
    title: 'ToxicoSaico',
    artist: 'Clothing',
    side: 'A',
    position: 7,
    durationSeconds: 170,
    audioSrc: '/songs/CLOTHING_ToxicoSaico.mp3'
  },
  {
    id: 'a08',
    title: 'Quémenme',
    artist: 'Cuauh',
    side: 'A',
    position: 8,
    durationSeconds: 180,
    audioSrc: '/songs/CUAUH_quemenme.mp3'
  },
  {
    id: 'a09',
    title: 'Tulipán',
    artist: 'D. Mantilla',
    side: 'A',
    position: 9,
    durationSeconds: 137,
    audioSrc: '/songs/D.MANTILLA_Tulipan.mp3'
  },
  {
    id: 'a10',
    title: 'Sonámbulo',
    artist: 'David Samuel y los Problemas de Macario',
    side: 'A',
    position: 10,
    durationSeconds: 457,
    audioSrc: '/songs/DAVID SAMUEL Y LOS PROBLEMAS DE MACARIO_sonanmbulo.mp3'
  },
  {
    id: 'a11',
    title: 'Maldito Enamorado',
    artist: 'Iván Ivengo',
    side: 'A',
    position: 11,
    durationSeconds: 134,
    audioSrc: '/songs/IVAN IVENGO_maldito enamorado.mp3'
  },
  {
    id: 'a12',
    title: 'La Candela Shikha',
    artist: 'Koyel Basu',
    side: 'A',
    position: 12,
    durationSeconds: 322,
    audioSrc: '/songs/KOYEL BASU_La Candela Shikha.mp3'
  },
  {
    id: 'a13',
    title: 'Estilo Mexa',
    artist: 'La Diabbla',
    side: 'A',
    position: 13,
    durationSeconds: 196,
    audioSrc: '/songs/LA DIABBLA_EstiloMexa.mp3'
  },

  // Side B
  {
    id: 'b01',
    title: 'Danza',
    artist: 'Linxe',
    side: 'B',
    position: 1,
    durationSeconds: 193,
    audioSrc: '/songs/LINXE_danza.mp3'
  },
  {
    id: 'b02',
    title: 'No Regresaré',
    artist: 'Los Hidalgo',
    side: 'B',
    position: 2,
    durationSeconds: 176,
    audioSrc: '/songs/LOS HIDALGO_No RegresarE.mp3'
  },
  {
    id: 'b03',
    title: 'Momento',
    artist: 'Malcriada',
    side: 'B',
    position: 3,
    durationSeconds: 170,
    audioSrc: '/songs/MALCRIADA_MOMENTO.mp3'
  },
  {
    id: 'b04',
    title: 'No Me Siento Como',
    artist: 'Mi$ha',
    side: 'B',
    position: 4,
    durationSeconds: 156,
    audioSrc: '/songs/MI$HA_NO ME SIENTO COMO.mp3'
  },
  {
    id: 'b05',
    title: 'Progreso',
    artist: 'Nina Fatal',
    side: 'B',
    position: 5,
    durationSeconds: 186,
    audioSrc: '/songs/NINA FATAL_PROGRRESO.mp3'
  },
  {
    id: 'b06',
    title: 'Sheep en la Gran Ciudad',
    artist: 'Perra Brava',
    side: 'B',
    position: 6,
    durationSeconds: 213,
    audioSrc: '/songs/PERRA BRAVA_Sheep en la gran Ciudad.mp3'
  },
  {
    id: 'b07',
    title: 'Vanilla Sky',
    artist: 'Rase X',
    side: 'B',
    position: 7,
    durationSeconds: 160,
    audioSrc: '/songs/RASE X_Vanilla Sky.mp3'
  },
  {
    id: 'b08',
    title: 'Hadas en Greenscreen',
    artist: 'Siglo Vacío',
    side: 'B',
    position: 8,
    durationSeconds: 139,
    audioSrc: '/songs/SIGLO VACIO_Hadasen greenscreen.mp3'
  },
  {
    id: 'b09',
    title: 'La Perra Más Bonita del Cielo',
    artist: 'Sochi',
    side: 'B',
    position: 9,
    durationSeconds: 202,
    audioSrc: '/songs/SOCHI_La Perra mas BonitadelCielo.mp3'
  },
  {
    id: 'b10',
    title: 'Las Nubes Caen',
    artist: 'Timoti la Motocasco',
    side: 'B',
    position: 10,
    durationSeconds: 329,
    audioSrc: '/songs/TIMOTI LA MOTOCASCO_Lasnubes caen-2.mp3'
  },
  {
    id: 'b11',
    title: 'El Títere',
    artist: 'Títere Charro',
    side: 'B',
    position: 11,
    durationSeconds: 177,
    audioSrc: '/songs/TITERE CHARRO-El Titere .mp3'
  },
  {
    id: 'b12',
    title: 'M.F.C.',
    artist: 'Ulises Richards',
    side: 'B',
    position: 12,
    durationSeconds: 194,
    audioSrc: '/songs/ULISES RICHARDS_M.F.C..mp3'
  },
  {
    id: 'b13',
    title: 'Gato Negro',
    artist: 'Vilevo',
    side: 'B',
    position: 13,
    durationSeconds: 169,
    audioSrc: '/songs/VILEVO_Gato Negro.mp3'
  }
]

export const MOCK_PLAYER_STATE: PlayerState = {
  currentSongId: 'a01',
  currentSide: 'A',
  elapsedSeconds: 0,
  isPlaying: false,
  date: 'MAR. 20/26'
}

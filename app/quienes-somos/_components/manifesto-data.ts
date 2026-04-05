interface BlockData {
  type: 'headline' | 'terminal' | 'subhead' | 'spacer' | 'glitch-line'
  text?: string
  size?: 'xl' | 'lg' | 'md' | 'sm'
  color?: 'red' | 'white' | 'gray'
  align?: 'left' | 'center' | 'right'
  indent?: boolean
}

export const MANIFESTO_BLOCKS: BlockData[] = [
  // ── Opening ──
  { type: 'headline', text: 'RU!DOZO ES UN ERROR', size: 'xl', color: 'white' },
  { type: 'headline', text: 'DEL SISTEMA', size: 'xl', color: 'red', indent: true },
  { type: 'glitch-line' },

  { type: 'subhead', text: 'RU!DOZO', color: 'white' },
  { type: 'terminal', text: 'no debería de existir.', color: 'gray' },
  { type: 'glitch-line' },

  {
    type: 'terminal',
    text: 'En teoría ya hay todo: plataformas, distribución, herramientas, "estrategias" para crecer. Se supone que nunca había sido tan fácil hacer música y compartirla.',
    color: 'gray'
  },

  { type: 'spacer' },

  // ── Pero algo no está pasando ──
  { type: 'headline', text: 'PERO ALGO NO ESTA PASANDO', size: 'lg', color: 'red' },
  { type: 'glitch-line' },

  {
    type: 'terminal',
    text: 'Hay más música que nunca, pero cada vez es más difícil que alguien la escuche de verdad.',
    color: 'red'
  },

  {
    type: 'terminal',
    text: 'No porque falte talento, sino porque todo está diseñado para competir por atención, no para',
    color: 'white'
  },

  { type: 'headline', text: 'CONECTAR', size: 'md', color: 'white', indent: true },
  { type: 'glitch-line' },

  {
    type: 'terminal',
    text: 'Todo empuja a moverte más rápido, a publicar más, a optimizar, a entender un juego que cambia todo el tiempo... y que casi nunca está a favor de quien está empezando.',
    color: 'red',
    indent: true
  },

  { type: 'spacer' },

  // ── Se pierde el encuentro ──
  { type: 'glitch-line' },
  { type: 'subhead', text: '> se pierde: EL ENCUENTRO.', color: 'white' },

  { type: 'terminal', text: 'RU!DOZO nace desde ahí.', color: 'gray', indent: true },

  {
    type: 'terminal',
    text: 'como un intento de abrir un espacio distinto. Uno donde la música no tenga que pelear por segundos de atención, sino encontrar a quien sí quiere escucharla.',
    color: 'gray',
    indent: true
  },

  { type: 'spacer' },

  // ── El cassette semanal ──
  { type: 'subhead', text: '> Por eso existe el cassette semanal.', color: 'white' },
  { type: 'subhead', text: '> 90 minutos. No más.', color: 'red' },

  {
    type: 'terminal',
    text: 'No se trata de consumir más música, sino de relacionarnos distinto con ella.',
    color: 'gray',
    indent: true
  },

  { type: 'spacer' },

  // ── Es la gente ──
  { type: 'glitch-line' },
  { type: 'headline', text: 'RU!DOZO no es solo lo que suena.', size: 'md', color: 'red', align: 'center' },
  { type: 'headline', text: 'ES LA GENTE', size: 'xl', color: 'white', align: 'center' },
  { type: 'subhead', text: '> PORQUE NADIE CONSTRUYE UNA ESCENA SOLO', color: 'white', align: 'center' },
  { type: 'glitch-line' },

  { type: 'spacer' },

  {
    type: 'terminal',
    text: 'La idea es simple: que quienes hacen música se encuentren. Que aparezcan conexiones reales. Que alguien encuentre a su banda, a su venue, a su siguiente proyecto. Que las oportunidades no dependan únicamente de números, sino de afinidad, de cercanía, de estar en el lugar correcto con la gente correcta.',
    color: 'gray'
  },

  {
    type: 'terminal',
    text: 'RU!DOZO quiere ser un puente. Entre quienes hacen que la música exista: bandas, músicos, managers, venues, gente que escucha y gente que mueve las cosas.',
    color: 'gray',
    indent: true
  },

  { type: 'spacer' },

  // ── Cierre ──
  { type: 'glitch-line' },

  { type: 'terminal', text: 'Que la música no se quede atorada.', color: 'white' },
  { type: 'terminal', text: 'Que circule.', color: 'gray' },
  { type: 'terminal', text: 'Que encuentre.', color: 'gray' },
  { type: 'terminal', text: 'Que suene.', color: 'gray' },

  { type: 'spacer' },

  { type: 'headline', text: 'Y QUE SUENE BIEN FUERTE', size: 'xl', color: 'red', align: 'center' }
]

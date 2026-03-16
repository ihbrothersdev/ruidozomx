import type { CommunityProfile } from './types'

/** Placeholder profile photos from picsum */
const photo = (seed: number) => `https://picsum.photos/seed/ruidozo${seed}/400/500`

export const MOCK_PROFILES: CommunityProfile[] = [
  {
    id: 'mock-banda-1',
    display_name: 'Los Desvelados',
    slug: 'los-desvelados',
    photo_url: photo(1),
    role: 'banda',
    city: 'CDMX',
    state: 'CDMX',
    country: 'México',
    bio: 'Punk rock desde el corazón de la Roma.',
    activity_highlight: 'Rolas propuestas al casete\nGénero: Punk Rock',
    isMock: true
  },
  {
    id: 'mock-fan-1',
    display_name: 'Mariana Ruiz',
    slug: 'mariana-ruiz',
    photo_url: photo(2),
    role: 'fan',
    city: 'Guadalajara',
    state: 'Jalisco',
    country: 'México',
    bio: 'Siempre en primera fila.',
    activity_highlight: 'Rolas propuestas al casete\nBandas que le gustan',
    isMock: true
  },
  {
    id: 'mock-venue-1',
    display_name: 'Foro Insurgente',
    slug: 'foro-insurgente',
    photo_url: photo(3),
    role: 'venue',
    city: 'CDMX',
    state: 'CDMX',
    country: 'México',
    bio: 'Espacio para la música independiente.',
    activity_highlight: 'Fechas disponibles\nConvocatoria abierta',
    isMock: true
  },
  {
    id: 'mock-promotor-1',
    display_name: 'Colectivo Sónico',
    slug: 'colectivo-sonico',
    photo_url: photo(4),
    role: 'promotor',
    city: 'Monterrey',
    state: 'Nuevo León',
    country: 'México',
    bio: 'Moviendo la escena del norte.',
    activity_highlight: 'Eventos activos\nBandas representadas',
    isMock: true
  },
  {
    id: 'mock-manager-1',
    display_name: 'Diego Salazar',
    slug: 'diego-salazar',
    photo_url: photo(5),
    role: 'manager',
    city: 'CDMX',
    state: 'CDMX',
    country: 'México',
    bio: 'Manager de artistas emergentes.',
    activity_highlight: 'Artistas representados\nPropuestas enviadas',
    isMock: true
  },
  {
    id: 'mock-banda-2',
    display_name: 'Nebulosa Roja',
    slug: 'nebulosa-roja',
    photo_url: photo(6),
    role: 'banda',
    city: 'Puebla',
    state: 'Puebla',
    country: 'México',
    bio: 'Shoegaze y sueños.',
    activity_highlight: 'Rolas propuestas al casete\nGénero: Shoegaze',
    isMock: true
  },
  {
    id: 'mock-agente-1',
    display_name: 'Fernanda López',
    slug: 'fernanda-lopez',
    photo_url: photo(7),
    role: 'agente',
    city: 'Querétaro',
    state: 'Querétaro',
    country: 'México',
    bio: 'Conectando talento con escenarios.',
    activity_highlight: 'Circuitos armados\nBandas conectadas',
    isMock: true
  },
  {
    id: 'mock-proveedor-1',
    display_name: 'Sound Factory MX',
    slug: 'sound-factory-mx',
    photo_url: photo(8),
    role: 'proveedor',
    city: 'CDMX',
    state: 'CDMX',
    country: 'México',
    bio: 'Renta de audio profesional.',
    activity_highlight: 'Servicios: Audio en vivo\nPromos activas',
    isMock: true
  },
  {
    id: 'mock-fan-2',
    display_name: 'Carlos Vega',
    slug: 'carlos-vega',
    photo_url: photo(9),
    role: 'fan',
    city: 'León',
    state: 'Guanajuato',
    country: 'México',
    bio: 'Melómano incurable.',
    activity_highlight: 'Rolas propuestas al casete\nBandas que le gustan',
    isMock: true
  },
  {
    id: 'mock-venue-2',
    display_name: 'La Cueva',
    slug: 'la-cueva',
    photo_url: photo(10),
    role: 'venue',
    city: 'Guadalajara',
    state: 'Jalisco',
    country: 'México',
    bio: 'Rock underground en el centro.',
    activity_highlight: 'Fechas disponibles\nRecibe propuestas',
    isMock: true
  },
  {
    id: 'mock-banda-3',
    display_name: 'Fractal',
    slug: 'fractal',
    photo_url: photo(11),
    role: 'banda',
    city: 'Oaxaca',
    state: 'Oaxaca',
    country: 'México',
    bio: 'Math rock experimental.',
    activity_highlight: 'Rolas propuestas al casete\nGénero: Math Rock',
    isMock: true
  }
]

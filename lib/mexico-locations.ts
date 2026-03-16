/**
 * Mexican states and major cities for cascading location dropdowns.
 * País → Estado → Ciudad
 */

export const COUNTRIES = ['México'] as const

export const MEXICO_STATES: Record<string, string[]> = {
  Aguascalientes: ['Aguascalientes', 'Jesús María', 'Calvillo', 'Rincón de Romos'],
  'Baja California': ['Tijuana', 'Mexicali', 'Ensenada', 'Rosarito', 'Tecate'],
  'Baja California Sur': ['La Paz', 'Los Cabos', 'San José del Cabo', 'Cabo San Lucas', 'Loreto'],
  Campeche: ['Campeche', 'Ciudad del Carmen', 'Champotón', 'Escárcega'],
  Chiapas: ['Tuxtla Gutiérrez', 'San Cristóbal de las Casas', 'Tapachula', 'Comitán', 'Palenque'],
  Chihuahua: ['Chihuahua', 'Ciudad Juárez', 'Delicias', 'Cuauhtémoc', 'Parral'],
  'Ciudad de México': [
    'Álvaro Obregón',
    'Azcapotzalco',
    'Benito Juárez',
    'Coyoacán',
    'Cuajimalpa',
    'Cuauhtémoc',
    'Gustavo A. Madero',
    'Iztacalco',
    'Iztapalapa',
    'Magdalena Contreras',
    'Miguel Hidalgo',
    'Milpa Alta',
    'Tláhuac',
    'Tlalpan',
    'Venustiano Carranza',
    'Xochimilco'
  ],
  Coahuila: ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras', 'Acuña'],
  Colima: ['Colima', 'Manzanillo', 'Tecomán', 'Villa de Álvarez'],
  Durango: ['Durango', 'Gómez Palacio', 'Lerdo', 'Santiago Papasquiaro'],
  'Estado de México': [
    'Toluca',
    'Ecatepec',
    'Naucalpan',
    'Nezahualcóyotl',
    'Tlalnepantla',
    'Huixquilucan',
    'Metepec',
    'Atizapán',
    'Coacalco',
    'Cuautitlán Izcalli',
    'Texcoco',
    'Valle de Bravo'
  ],
  Guanajuato: ['León', 'Guanajuato', 'Irapuato', 'Celaya', 'Salamanca', 'San Miguel de Allende'],
  Guerrero: ['Acapulco', 'Chilpancingo', 'Zihuatanejo', 'Iguala', 'Taxco'],
  Hidalgo: ['Pachuca', 'Tulancingo', 'Tula', 'Huejutla', 'Mineral del Monte'],
  Jalisco: ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Puerto Vallarta', 'Tlajomulco', 'Lagos de Moreno'],
  Michoacán: ['Morelia', 'Uruapan', 'Zamora', 'Lázaro Cárdenas', 'Pátzcuaro'],
  Morelos: ['Cuernavaca', 'Jiutepec', 'Cuautla', 'Temixco', 'Tepoztlán'],
  Nayarit: ['Tepic', 'Bahía de Banderas', 'Santiago Ixcuintla', 'Compostela'],
  'Nuevo León': [
    'Monterrey',
    'San Pedro Garza García',
    'San Nicolás',
    'Guadalupe',
    'Apodaca',
    'Santa Catarina',
    'García'
  ],
  Oaxaca: ['Oaxaca de Juárez', 'Salina Cruz', 'Juchitán', 'Huatulco', 'Tuxtepec'],
  Puebla: ['Puebla', 'Tehuacán', 'San Andrés Cholula', 'San Pedro Cholula', 'Atlixco'],
  Querétaro: ['Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués', 'Tequisquiapan'],
  'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Chetumal', 'Tulum', 'Cozumel'],
  'San Luis Potosí': ['San Luis Potosí', 'Soledad de Graciano Sánchez', 'Ciudad Valles', 'Matehuala'],
  Sinaloa: ['Culiacán', 'Mazatlán', 'Los Mochis', 'Guasave', 'Navolato'],
  Sonora: ['Hermosillo', 'Ciudad Obregón', 'Nogales', 'Guaymas', 'San Luis Río Colorado'],
  Tabasco: ['Villahermosa', 'Cárdenas', 'Comalcalco', 'Paraíso', 'Macuspana'],
  Tamaulipas: ['Tampico', 'Reynosa', 'Matamoros', 'Nuevo Laredo', 'Ciudad Victoria'],
  Tlaxcala: ['Tlaxcala', 'Apizaco', 'Huamantla', 'San Pablo del Monte', 'Chiautempan'],
  Veracruz: ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Córdoba', 'Orizaba', 'Poza Rica', 'Boca del Río'],
  Yucatán: ['Mérida', 'Valladolid', 'Progreso', 'Tizimín', 'Umán'],
  Zacatecas: ['Zacatecas', 'Fresnillo', 'Guadalupe', 'Jerez', 'Río Grande']
}

/** Get all states for a country */
export function getStates(country: string): string[] {
  if (country === 'México') {
    return Object.keys(MEXICO_STATES).sort()
  }
  return []
}

/** Get cities for a given state */
export function getCities(state: string): string[] {
  return MEXICO_STATES[state] ?? []
}

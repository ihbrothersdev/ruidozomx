/**
 * Location data for cascading dropdowns: País → Estado/Provincia → Ciudad
 */

export const COUNTRIES = [
  'México',
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Estados Unidos',
  'Guatemala',
  'Honduras',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Puerto Rico',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro',
] as const

export type Country = (typeof COUNTRIES)[number]

// ---------------------------------------------------------------------------
// México
// ---------------------------------------------------------------------------
const MEXICO: Record<string, string[]> = {
  Aguascalientes: ['Aguascalientes', 'Jesús María', 'Calvillo'],
  'Baja California': ['Tijuana', 'Mexicali', 'Ensenada', 'Rosarito'],
  'Baja California Sur': ['La Paz', 'Los Cabos', 'Loreto'],
  Campeche: ['Campeche', 'Ciudad del Carmen'],
  Chiapas: ['Tuxtla Gutiérrez', 'San Cristóbal de las Casas', 'Tapachula'],
  Chihuahua: ['Chihuahua', 'Ciudad Juárez', 'Delicias'],
  'Ciudad de México': [
    'Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuauhtémoc',
    'Gustavo A. Madero', 'Iztapalapa', 'Miguel Hidalgo', 'Tlalpan', 'Xochimilco',
  ],
  Coahuila: ['Saltillo', 'Torreón', 'Monclova'],
  Colima: ['Colima', 'Manzanillo'],
  Durango: ['Durango', 'Gómez Palacio'],
  'Estado de México': ['Toluca', 'Ecatepec', 'Naucalpan', 'Nezahualcóyotl', 'Metepec'],
  Guanajuato: ['León', 'Guanajuato', 'Celaya', 'San Miguel de Allende'],
  Guerrero: ['Acapulco', 'Chilpancingo', 'Zihuatanejo'],
  Hidalgo: ['Pachuca', 'Tulancingo'],
  Jalisco: ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Puerto Vallarta'],
  Michoacán: ['Morelia', 'Uruapan', 'Zamora', 'Pátzcuaro'],
  Morelos: ['Cuernavaca', 'Cuautla', 'Tepoztlán'],
  Nayarit: ['Tepic', 'Bahía de Banderas'],
  'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'San Nicolás', 'Guadalupe'],
  Oaxaca: ['Oaxaca de Juárez', 'Salina Cruz', 'Huatulco'],
  Puebla: ['Puebla', 'Tehuacán', 'Cholula', 'Atlixco'],
  Querétaro: ['Querétaro', 'San Juan del Río'],
  'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Chetumal', 'Tulum'],
  'San Luis Potosí': ['San Luis Potosí', 'Ciudad Valles'],
  Sinaloa: ['Culiacán', 'Mazatlán', 'Los Mochis'],
  Sonora: ['Hermosillo', 'Ciudad Obregón', 'Nogales'],
  Tabasco: ['Villahermosa', 'Cárdenas'],
  Tamaulipas: ['Tampico', 'Reynosa', 'Matamoros', 'Nuevo Laredo'],
  Tlaxcala: ['Tlaxcala', 'Apizaco'],
  Veracruz: ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Córdoba', 'Orizaba'],
  Yucatán: ['Mérida', 'Progreso', 'Valladolid'],
  Zacatecas: ['Zacatecas', 'Fresnillo'],
}

// ---------------------------------------------------------------------------
// Argentina
// ---------------------------------------------------------------------------
const ARGENTINA: Record<string, string[]> = {
  'Buenos Aires': ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Bahía Blanca'],
  Córdoba: ['Córdoba', 'Villa María', 'Río Cuarto'],
  Mendoza: ['Mendoza', 'San Rafael', 'Godoy Cruz'],
  Tucumán: ['San Miguel de Tucumán'],
  'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela'],
  Salta: ['Salta'],
  Misiones: ['Posadas', 'Puerto Iguazú'],
  Neuquén: ['Neuquén', 'Bariloche'],
  Corrientes: ['Corrientes'],
  'Entre Ríos': ['Paraná', 'Concordia'],
  Jujuy: ['San Salvador de Jujuy'],
  Chubut: ['Comodoro Rivadavia', 'Puerto Madryn'],
  'Río Negro': ['Bariloche', 'Viedma'],
  'Tierra del Fuego': ['Ushuaia'],
}

// ---------------------------------------------------------------------------
// Bolivia
// ---------------------------------------------------------------------------
const BOLIVIA: Record<string, string[]> = {
  'La Paz': ['La Paz', 'El Alto'],
  Cochabamba: ['Cochabamba', 'Quillacollo'],
  'Santa Cruz': ['Santa Cruz de la Sierra', 'Montero'],
  Potosí: ['Potosí', 'Uyuni'],
  Oruro: ['Oruro'],
  Chuquisaca: ['Sucre'],
  Tarija: ['Tarija', 'Yacuiba'],
  Beni: ['Trinidad'],
}

// ---------------------------------------------------------------------------
// Chile
// ---------------------------------------------------------------------------
const CHILE: Record<string, string[]> = {
  'Región Metropolitana': ['Santiago', 'Puente Alto', 'Maipú', 'Las Condes', 'Ñuñoa'],
  Valparaíso: ['Valparaíso', 'Viña del Mar', 'Quilpué'],
  Biobío: ['Concepción', 'Talcahuano', 'Los Ángeles'],
  Araucanía: ['Temuco', 'Villarrica'],
  Coquimbo: ['La Serena', 'Coquimbo'],
  Antofagasta: ['Antofagasta', 'Calama'],
  'Los Lagos': ['Puerto Montt', 'Osorno', 'Castro'],
  Maule: ['Talca', 'Curicó'],
  Tarapacá: ['Iquique'],
  Magallanes: ['Punta Arenas'],
}

// ---------------------------------------------------------------------------
// Colombia
// ---------------------------------------------------------------------------
const COLOMBIA: Record<string, string[]> = {
  Cundinamarca: ['Bogotá', 'Soacha', 'Chía'],
  Antioquia: ['Medellín', 'Bello', 'Envigado', 'Itagüí'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura'],
  Atlántico: ['Barranquilla', 'Soledad'],
  Bolívar: ['Cartagena'],
  Santander: ['Bucaramanga', 'Floridablanca', 'Barrancabermeja'],
  Córdoba: ['Montería'],
  'Norte de Santander': ['Cúcuta'],
  Risaralda: ['Pereira', 'Dosquebradas'],
  Quindío: ['Armenia'],
  Caldas: ['Manizales'],
  Nariño: ['Pasto', 'Tumaco'],
  Cauca: ['Popayán'],
  Huila: ['Neiva'],
  Meta: ['Villavicencio'],
  Tolima: ['Ibagué'],
}

// ---------------------------------------------------------------------------
// Costa Rica
// ---------------------------------------------------------------------------
const COSTA_RICA: Record<string, string[]> = {
  'San José': ['San José', 'Escazú', 'Desamparados', 'Curridabat'],
  Alajuela: ['Alajuela', 'Grecia'],
  Cartago: ['Cartago', 'Turrialba'],
  Heredia: ['Heredia', 'San Pablo'],
  Guanacaste: ['Liberia', 'Nicoya'],
  Puntarenas: ['Puntarenas', 'Quepos'],
  Limón: ['Limón'],
}

// ---------------------------------------------------------------------------
// Cuba
// ---------------------------------------------------------------------------
const CUBA: Record<string, string[]> = {
  'La Habana': ['La Habana'],
  Santiago: ['Santiago de Cuba'],
  Holguín: ['Holguín'],
  Camagüey: ['Camagüey'],
  'Villa Clara': ['Santa Clara'],
  Matanzas: ['Matanzas', 'Varadero'],
  Pinar: ['Pinar del Río'],
  Granma: ['Bayamo', 'Manzanillo'],
}

// ---------------------------------------------------------------------------
// Ecuador
// ---------------------------------------------------------------------------
const ECUADOR: Record<string, string[]> = {
  Pichincha: ['Quito', 'Cayambe'],
  Guayas: ['Guayaquil', 'Durán', 'Samborondón'],
  Azuay: ['Cuenca'],
  Manabí: ['Manta', 'Portoviejo'],
  'El Oro': ['Machala'],
  Imbabura: ['Ibarra', 'Otavalo'],
  Tungurahua: ['Ambato'],
  Loja: ['Loja'],
  'Santo Domingo': ['Santo Domingo'],
  'Santa Elena': ['Salinas'],
}

// ---------------------------------------------------------------------------
// El Salvador
// ---------------------------------------------------------------------------
const EL_SALVADOR: Record<string, string[]> = {
  'San Salvador': ['San Salvador', 'Soyapango', 'Mejicanos', 'Apopa'],
  'Santa Ana': ['Santa Ana', 'Chalchuapa'],
  'San Miguel': ['San Miguel'],
  'La Libertad': ['Santa Tecla', 'Antiguo Cuscatlán'],
  Sonsonate: ['Sonsonate'],
  Usulután: ['Usulután'],
  Cuscatlán: ['Cojutepeque'],
  'La Paz': ['Zacatecoluca'],
}

// ---------------------------------------------------------------------------
// España
// ---------------------------------------------------------------------------
const ESPANA: Record<string, string[]> = {
  Madrid: ['Madrid', 'Alcalá de Henares', 'Getafe', 'Leganés'],
  Cataluña: ['Barcelona', 'Badalona', 'Terrassa', 'Lleida', 'Tarragona'],
  Andalucía: ['Sevilla', 'Málaga', 'Córdoba', 'Granada', 'Almería', 'Cádiz'],
  'País Vasco': ['Bilbao', 'San Sebastián', 'Vitoria-Gasteiz'],
  Valencia: ['Valencia', 'Alicante', 'Castellón'],
  Galicia: ['Vigo', 'A Coruña', 'Santiago de Compostela'],
  Canarias: ['Las Palmas de Gran Canaria', 'Santa Cruz de Tenerife'],
  Murcia: ['Murcia', 'Cartagena'],
  Aragón: ['Zaragoza'],
  Asturias: ['Oviedo', 'Gijón'],
  'Castilla y León': ['Valladolid', 'Salamanca', 'Burgos', 'León'],
  'Castilla-La Mancha': ['Toledo', 'Albacete'],
  Navarra: ['Pamplona'],
  Baleares: ['Palma', 'Ibiza'],
  Extremadura: ['Badajoz', 'Cáceres'],
  Cantabria: ['Santander'],
  'La Rioja': ['Logroño'],
}

// ---------------------------------------------------------------------------
// Estados Unidos
// ---------------------------------------------------------------------------
const USA: Record<string, string[]> = {
  California: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'Oakland'],
  Texas: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'El Paso', 'Laredo'],
  Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
  'New York': ['New York City', 'Buffalo', 'Rochester'],
  Illinois: ['Chicago'],
  Arizona: ['Phoenix', 'Tucson', 'Mesa'],
  Washington: ['Seattle', 'Spokane'],
  Colorado: ['Denver', 'Colorado Springs'],
  Georgia: ['Atlanta', 'Savannah'],
  Nevada: ['Las Vegas', 'Reno'],
  'New Mexico': ['Albuquerque', 'Santa Fe'],
  Oregon: ['Portland', 'Eugene'],
  Massachusetts: ['Boston', 'Cambridge'],
  Tennessee: ['Nashville', 'Memphis'],
  Louisiana: ['New Orleans', 'Baton Rouge'],
  'New Jersey': ['Newark', 'Jersey City'],
  Pennsylvania: ['Philadelphia', 'Pittsburgh'],
  Michigan: ['Detroit', 'Grand Rapids'],
  Minnesota: ['Minneapolis', 'Saint Paul'],
  Missouri: ['Kansas City', 'Saint Louis'],
}

// ---------------------------------------------------------------------------
// Guatemala
// ---------------------------------------------------------------------------
const GUATEMALA: Record<string, string[]> = {
  Guatemala: ['Ciudad de Guatemala', 'Mixco', 'Villa Nueva'],
  Quetzaltenango: ['Quetzaltenango', 'Coatepeque'],
  Escuintla: ['Escuintla', 'Puerto San José'],
  'Alta Verapaz': ['Cobán'],
  Sacatepéquez: ['Antigua Guatemala'],
  Izabal: ['Puerto Barrios', 'Livingston'],
  Huehuetenango: ['Huehuetenango'],
  Petén: ['Flores', 'Santa Elena'],
  'San Marcos': ['San Marcos', 'Malacatán'],
}

// ---------------------------------------------------------------------------
// Honduras
// ---------------------------------------------------------------------------
const HONDURAS: Record<string, string[]> = {
  'Francisco Morazán': ['Tegucigalpa', 'Comayagüela'],
  Cortés: ['San Pedro Sula', 'Choloma', 'La Lima'],
  Atlántida: ['La Ceiba', 'Tela'],
  Choluteca: ['Choluteca'],
  Comayagua: ['Comayagua', 'Siguatepeque'],
  Copán: ['Santa Rosa de Copán'],
  Olancho: ['Juticalpa'],
  Yoro: ['El Progreso'],
  'Islas de la Bahía': ['Roatán', 'Utila'],
}

// ---------------------------------------------------------------------------
// Nicaragua
// ---------------------------------------------------------------------------
const NICARAGUA: Record<string, string[]> = {
  Managua: ['Managua', 'Tipitapa', 'Ciudad Sandino'],
  León: ['León'],
  Matagalpa: ['Matagalpa'],
  Chinandega: ['Chinandega'],
  Masaya: ['Masaya'],
  Granada: ['Granada'],
  Estelí: ['Estelí'],
  Rivas: ['Rivas', 'San Juan del Sur'],
  Jinotega: ['Jinotega'],
}

// ---------------------------------------------------------------------------
// Panamá
// ---------------------------------------------------------------------------
const PANAMA: Record<string, string[]> = {
  Panamá: ['Ciudad de Panamá', 'San Miguelito'],
  'Panamá Oeste': ['La Chorrera', 'Arraiján'],
  Colón: ['Colón'],
  Chiriquí: ['David', 'Boquete'],
  Coclé: ['Penonomé', 'Aguadulce'],
  Veraguas: ['Santiago'],
  Herrera: ['Chitré'],
  'Bocas del Toro': ['Bocas del Toro', 'Changuinola'],
}

// ---------------------------------------------------------------------------
// Paraguay
// ---------------------------------------------------------------------------
const PARAGUAY: Record<string, string[]> = {
  Central: ['Asunción', 'Luque', 'San Lorenzo', 'Fernando de la Mora', 'Lambaré'],
  'Alto Paraná': ['Ciudad del Este', 'Presidente Franco'],
  Itapúa: ['Encarnación'],
  Caaguazú: ['Coronel Oviedo'],
  Concepción: ['Concepción'],
  Amambay: ['Pedro Juan Caballero'],
  Guairá: ['Villarrica'],
  Misiones: ['San Ignacio'],
}

// ---------------------------------------------------------------------------
// Perú
// ---------------------------------------------------------------------------
const PERU: Record<string, string[]> = {
  Lima: ['Lima', 'Miraflores', 'Santiago de Surco', 'San Juan de Lurigancho'],
  Callao: ['Callao'],
  Arequipa: ['Arequipa'],
  Cusco: ['Cusco'],
  Trujillo: ['Trujillo'],
  Piura: ['Piura', 'Sullana'],
  Chiclayo: ['Chiclayo'],
  Iquitos: ['Iquitos'],
  Huancayo: ['Huancayo'],
  Puno: ['Puno', 'Juliaca'],
  Tacna: ['Tacna'],
}

// ---------------------------------------------------------------------------
// Puerto Rico
// ---------------------------------------------------------------------------
const PUERTO_RICO: Record<string, string[]> = {
  'Zona Metro': ['San Juan', 'Bayamón', 'Carolina', 'Guaynabo'],
  'Zona Sur': ['Ponce', 'Juana Díaz'],
  'Zona Norte': ['Arecibo', 'Manatí'],
  'Zona Oeste': ['Mayagüez', 'Aguadilla'],
  'Zona Este': ['Humacao', 'Fajardo'],
}

// ---------------------------------------------------------------------------
// República Dominicana
// ---------------------------------------------------------------------------
const REP_DOMINICANA: Record<string, string[]> = {
  'Distrito Nacional': ['Santo Domingo'],
  'Santo Domingo': ['Santo Domingo Este', 'Santo Domingo Norte', 'Boca Chica'],
  Santiago: ['Santiago de los Caballeros'],
  'La Altagracia': ['Higüey', 'Punta Cana'],
  'La Romana': ['La Romana'],
  'Puerto Plata': ['Puerto Plata', 'Sosúa'],
  Duarte: ['San Francisco de Macorís'],
  Samaná: ['Las Terrenas'],
  'La Vega': ['La Vega', 'Jarabacoa'],
}

// ---------------------------------------------------------------------------
// Uruguay
// ---------------------------------------------------------------------------
const URUGUAY: Record<string, string[]> = {
  Montevideo: ['Montevideo'],
  Canelones: ['Las Piedras', 'Pando', 'Ciudad de la Costa'],
  Maldonado: ['Punta del Este', 'Maldonado'],
  Salto: ['Salto'],
  Paysandú: ['Paysandú'],
  Rivera: ['Rivera'],
  Colonia: ['Colonia del Sacramento'],
  'San José': ['San José de Mayo'],
}

// ---------------------------------------------------------------------------
// Venezuela
// ---------------------------------------------------------------------------
const VENEZUELA: Record<string, string[]> = {
  'Distrito Capital': ['Caracas'],
  Zulia: ['Maracaibo', 'Cabimas', 'San Francisco'],
  Carabobo: ['Valencia', 'Puerto Cabello'],
  Miranda: ['Los Teques', 'Guarenas', 'Guatire'],
  Aragua: ['Maracay', 'La Victoria'],
  Lara: ['Barquisimeto', 'Cabudare'],
  Anzoátegui: ['Barcelona', 'Puerto La Cruz'],
  Bolívar: ['Ciudad Guayana', 'Ciudad Bolívar'],
  Táchira: ['San Cristóbal'],
  Mérida: ['Mérida'],
  Monagas: ['Maturín'],
  Sucre: ['Cumaná'],
  Falcón: ['Coro', 'Punto Fijo'],
}

// ---------------------------------------------------------------------------
// Master lookup
// ---------------------------------------------------------------------------
const LOCATION_DATA: Partial<Record<string, Record<string, string[]>>> = {
  México: MEXICO,
  Argentina: ARGENTINA,
  Bolivia: BOLIVIA,
  Chile: CHILE,
  Colombia: COLOMBIA,
  'Costa Rica': COSTA_RICA,
  Cuba: CUBA,
  Ecuador: ECUADOR,
  'El Salvador': EL_SALVADOR,
  España: ESPANA,
  'Estados Unidos': USA,
  Guatemala: GUATEMALA,
  Honduras: HONDURAS,
  Nicaragua: NICARAGUA,
  Panamá: PANAMA,
  Paraguay: PARAGUAY,
  Perú: PERU,
  'Puerto Rico': PUERTO_RICO,
  'República Dominicana': REP_DOMINICANA,
  Uruguay: URUGUAY,
  Venezuela: VENEZUELA,
}

/** Keep backward compat */
export const MEXICO_STATES = MEXICO

/** Get all states/provinces for a country */
export function getStates(country: string): string[] {
  const data = LOCATION_DATA[country]
  if (!data) return []
  return Object.keys(data).sort()
}

/** Get cities for a given state within a country */
export function getCities(country: string, state: string): string[] {
  return LOCATION_DATA[country]?.[state] ?? []
}

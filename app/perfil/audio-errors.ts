/** User-facing labels for the audio upload error codes from audioMetaError. */
export const AUDIO_ERROR_LABEL: Record<string, string> = {
  faltan_datos: 'Falta el archivo de audio.',
  archivo_vacio: 'El archivo está vacío.',
  archivo_muy_grande: 'El MP3 supera el límite de 30 MB.',
  tipo_no_soportado: 'El archivo debe ser un MP3.'
}

/** Translate a prepare/upload error into a friendly message (passes through prose). */
export function audioErrorMessage(code: string): string {
  return AUDIO_ERROR_LABEL[code] ?? code
}

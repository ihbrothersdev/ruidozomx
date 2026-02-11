const AUTH_ERROR_MAP: Record<string, string> = {
  'email rate limit exceeded': 'Demasiados intentos. Espera unos minutos antes de volver a intentar.',
  'invalid login credentials': 'Email o contraseña incorrectos.',
  'email not confirmed': 'Tu email aún no ha sido confirmado. Revisa tu bandeja de entrada.',
  'user already registered': 'Ya existe una cuenta con este email.',
  'password should be at least': 'La contraseña debe tener al menos 6 caracteres.',
  'signup is disabled': 'El registro de nuevos usuarios está deshabilitado.',
  'user not found': 'No se encontró una cuenta con este email.',
  'new password should be different': 'La nueva contraseña debe ser diferente a la anterior.',
  'auth session missing': 'Tu sesión ha expirado. Inicia sesión de nuevo.',
  'refresh token not found': 'Tu sesión ha expirado. Inicia sesión de nuevo.',
  'invalid refresh token': 'Tu sesión ha expirado. Inicia sesión de nuevo.',
  'otp has expired': 'El código de verificación ha expirado. Solicita uno nuevo.',
  'token has expired': 'El enlace ha expirado. Solicita uno nuevo.',
  'too many requests': 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  'network error': 'Error de conexión. Verifica tu internet e intenta de nuevo.'
}

const DEFAULT_ERROR = 'Ocurrió un error inesperado. Intenta de nuevo.'

export function translateAuthError(message: string): string {
  const lower = message.toLowerCase()

  for (const [key, translated] of Object.entries(AUTH_ERROR_MAP)) {
    if (lower.includes(key)) {
      return translated
    }
  }

  return DEFAULT_ERROR
}

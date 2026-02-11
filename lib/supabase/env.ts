function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. ` +
        'Make sure it is defined in your .env.local file or deployment environment.'
    )
  }
  return value
}

export function getSupabaseEnv() {
  return {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  }
}

import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

const config = [
  ...nextVitals,
  ...nextTs,
  {
    plugins: { prettier: prettierPlugin },
    rules: { 'prettier/prettier': 'warn' }
  },
  prettierConfig,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'dist/**', 'node_modules/**', '.pnpm-store/**', 'next-env.d.ts']
  }
]

export default config

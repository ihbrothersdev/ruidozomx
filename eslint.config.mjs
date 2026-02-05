import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Prettier integration - runs Prettier as an ESLint rule
  {
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'warn'
    }
  },

  // Disable ESLint rules that conflict with Prettier
  prettierConfig,

  // Override default ignores
  globalIgnores(['.next/**', 'out/**', 'build/**', 'dist/**', 'node_modules/**', '.pnpm-store/**', 'next-env.d.ts'])
])

export default eslintConfig

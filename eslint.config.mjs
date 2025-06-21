import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  }),
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    rules: {
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+ with new JSX Transform
      'react/prop-types': 'off', // We use TypeScript for prop validation
      '@typescript-eslint/no-explicit-any': 'off', // Allow any types for flexibility
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }], // Allow unused vars that start with underscore
      'react/no-unknown-property': 'off', // Allow unknown properties for styled-jsx
      'no-case-declarations': 'off', // Allow declarations in case blocks
      'no-extra-boolean-cast': 'off', // Allow double negation
      'no-useless-catch': 'off', // Allow catch blocks that just rethrow
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },
  {
    ignores: ["src/generated/**"],
  }
]

export default eslintConfig

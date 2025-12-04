import js from '@eslint/js'
import globals from 'globals'
import json from '@eslint/json'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      'html/**',
      'app/**'
    ]
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest
      }
    },
    rules: {
      'indent': ['error', 2, { 'SwitchCase': 1 }],
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-undef': 'error',
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0, 'maxBOF': 0 }],
      'max-len': ['error', { 'code': 100, 'ignoreUrls': true, 'ignoreStrings': true }]
    }
  },
  {
    files: ['**/*.json'],
    ignores: ['package.json', 'package-lock.json', 'app/**'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended']
  },
])

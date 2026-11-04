import storybook from 'eslint-plugin-storybook';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  globalIgnores([
    '**/node_modules',
    'storybook-static/**',
    'coverage/**',
    '**/dist',
    '**/**.config.js',
    '**/**.config.mjs',
    '**/**.spec.ts',
  ]),
  storybook.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  {
    extends: [
      js.configs.recommended,
      prettierRecommended,
      reactHooks.configs['recommended-latest'],
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
    ],
    languageOptions: {
      ecmaVersion: 5,
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-refresh/only-export-components': 'error',
      'prettier/prettier': 'error',
      'no-empty': 'error',
      'no-console': [
        'error',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],
    },
  },
]);

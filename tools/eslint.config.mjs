/**
 * ESLint flat config for the assets build system.
 *
 * Two environments coexist here:
 *   - Node modules under `tools/` (lib, scripts, test, configs) —
 *     all `.mjs`, Node globals.
 *   - Browser entry scripts (`src/js/**`) that run with a
 *     WordPress-provided jQuery global.
 */

import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.cache/**',
      'src/Images/**',
      'package-lock.json',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['src/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.jquery,
        jQuery: 'readonly',
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

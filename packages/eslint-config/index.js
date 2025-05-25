import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import ts from 'typescript-eslint';

export default [
  {
    name: '@turtleby/setup',
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: 'module',
    },
  },
  {
    name: '@turtleby/env',
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    name: '@turtleby/env/tests',
    files: ['**/*.spec.*'],
    ignores: ['**/__snapshots__/**'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  prettier,
  {
    rules: {
      'no-alert': 'error',
      'no-console': 'warn',
      'prettier/prettier': 'warn',
    },
  },
];

import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tslint from 'typescript-eslint';

export default [
  {
    name: '@snowflake/setup',
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: 'module',
    },
  },
  {
    name: '@snowflake/env',
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    name: '@snowflake/env/tests',
    files: [`**/*.spec.*`],
    ignores: [`**/__snapshots__/**`],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  js.configs.recommended,
  ...tslint.configs.strictTypeChecked,
  ...tslint.configs.stylisticTypeChecked,
  prettier,
  {
    rules: {
      'no-alert': 'error',
      'no-console': 'error',
      'prettier/prettier': 'warn',
    },
  },
];

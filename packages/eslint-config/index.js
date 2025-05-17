import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
  {
    name: '@turtleby/js',
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  prettier,
  {
    rules: {
      'no-alert': 'error',
      'no-console': 'warn',
      'prettier/prettier': 'warn',
    },
  },
];

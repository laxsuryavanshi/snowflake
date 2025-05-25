import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';

export default [
  ...svelte.configs.recommended,
  ...svelte.configs.prettier,
  {
    name: '@turtleby/env/svelte',
    files: ['**/*.svelte'],
    ignores: ['.svelte-kit/*'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
      },
    },
  },
];

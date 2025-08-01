import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';

import { eslintConfig } from './index.js';

/** @type {ts.InfiniteDepthConfigWithExtends[]} */
export const svelteConfig = [
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

export default ts.config(...eslintConfig, ...svelteConfig);

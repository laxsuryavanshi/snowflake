import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath, URL } from 'node:url';

import config from '@turtleby/eslint-config';
import svelte from '@turtleby/eslint-config/svelte';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

const eslintConfig = [
  includeIgnoreFile(gitignorePath),
  ...config,
  ...svelte,
  {
    rules: {
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
  {
    ignores: ['.yarn/*', '.pnp.*'],
  },
];

export default eslintConfig;

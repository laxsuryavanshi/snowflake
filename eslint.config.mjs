import { includeIgnoreFile } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import config from '@turtleby/eslint-config';
import svelte from '@turtleby/eslint-config/svelte';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  includeIgnoreFile(gitignorePath),
  ...config,
  ...svelte,
  ...compat.extends('next/core-web-vitals'),
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

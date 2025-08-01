import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath, URL } from 'node:url';
import ts from 'typescript-eslint';

import { eslintConfig } from '@turtleby/eslint-config';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['.yarn/*', '.pnp.*'],
  },
  ...eslintConfig
);

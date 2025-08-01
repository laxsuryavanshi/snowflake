import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import ts from 'typescript-eslint';

import { eslintConfig } from './index.js';

/** @type {ts.InfiniteDepthConfigWithExtends[]} */
export const reactConfig = [
  {
    name: '@turtleby/env/react',
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];

export default ts.config(...eslintConfig, ...reactConfig);

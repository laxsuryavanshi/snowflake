import { FlatCompat } from '@eslint/eslintrc';
import ts from 'typescript-eslint';

import { reactConfig } from './react.js';

/** @type {ts.InfiniteDepthConfigWithExtends[]} */
export const nextConfig = [
  ...new FlatCompat({}).config({
    extends: ['next/core-web-vitals'],
  }),
];

export default ts.config(...reactConfig, ...nextConfig);

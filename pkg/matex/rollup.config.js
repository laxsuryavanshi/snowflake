import typescript from '@rollup/plugin-typescript';

import packageJson from './package.json' with { type: 'json' };

const input = 'src/index.ts';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
const peerDeps = Object.keys(packageJson.peerDependencies);
const external = [...peerDeps, 'react/jsx-runtime', /@mui\/material\/*/, /@mui\/icons-material\/*/];

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input,
    output: {
      dir: 'dist',
      format: 'cjs',
    },
    plugins: [typescript({ declarationDir: 'dist/types', exclude: 'src/**/*.spec.ts(x)?' })],
    external,
  },
  {
    input,
    output: {
      dir: 'dist/esm',
      format: 'esm',
      entryFileNames: '[name].mjs',
      preserveModules: true,
    },
    plugins: [typescript({ declaration: false })],
    external,
  },
];

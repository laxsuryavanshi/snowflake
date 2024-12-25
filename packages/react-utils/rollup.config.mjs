import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const input = 'src/index.ts';

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input,
    output: {
      dir: 'dist',
      format: 'cjs',
    },
    plugins: [peerDepsExternal(), typescript({ declarationDir: 'dist/types' })],
  },
  {
    input,
    output: {
      dir: 'dist/esm',
      format: 'esm',
      entryFileNames: '[name].mjs',
      preserveModules: true,
    },
    plugins: [peerDepsExternal(), typescript({ declaration: false })],
  },
];

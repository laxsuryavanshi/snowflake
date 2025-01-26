import dts from 'vite-plugin-dts';

import packageJson from './package.json' with { type: 'json' };

const peerDeps = Object.keys(packageJson.peerDependencies);
const external = [...peerDeps, 'react/jsx-runtime'];

/**
 * @param {string} entryName
 */
function getFileName(format, entryName) {
  /** @type {string} */
  let ext;

  switch (format) {
    case 'commonjs':
    case 'cjs':
      ext = 'js';
      break;
    case 'esm':
    case 'es':
      ext = 'mjs';
      break;
    default:
      ext = 'unsupported';
  }

  return `${entryName}.${ext}`;
}

/** @type {import('vite').UserConfig} */
export default {
  plugins: [dts({ include: ['src'], exclude: ['src/**/*.spec.ts(x)?'] })],
  build: {
    lib: {
      name: packageJson.name,
      entry: 'src/index.ts',
      formats: ['cjs', 'es'],
      fileName: getFileName,
    },
    rollupOptions: { external },
  },
};

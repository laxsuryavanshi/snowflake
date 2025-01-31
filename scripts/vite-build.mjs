/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from 'fs';
import path from 'path';
import { build } from 'vite';
import dts from 'vite-plugin-dts';

const root = process.argv[2];

if (!path.relative(process.env.PROJECT_CWD, root).startsWith('pkg')) {
  // eslint-disable-next-line no-console
  console.error('`vite-build` script currently supports only library mode builds');
  process.exit(1);
}

const { name, peerDependencies } = JSON.parse(fs.readFileSync(path.resolve(root, 'package.json')));

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const peerDeps = Object.keys(peerDependencies);
const external = [...peerDeps, ...peerDeps.map(dep => new RegExp(`^${dep}/*`))];

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

void (await build({
  root,
  plugins: [dts({ include: 'src', exclude: 'src/**/*.spec.ts(x)?' })],
  build: {
    lib: {
      name,
      entry: path.resolve(root, 'src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: getFileName,
    },
    rollupOptions: {
      external,
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
          return;
        }
        warn(warning);
      },
    },
    minify: false,
  },
}));

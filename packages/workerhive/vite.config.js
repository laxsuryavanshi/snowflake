import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command, mode }) => {
  if (command === 'serve' || mode === 'app') {
    return appConfig;
  }

  return libConfig;
});

/** @type {UserConfig} */
const appConfig = {
  plugins: [tailwindcss()],
};

/** @type {UserConfig} */
const libConfig = {
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      include: ['src/lib/**/*.ts'],
    }),
  ],
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['comlink'],
      output: {
        preserveModules: true,
        entryFileNames: '[name].js',
      },
    },
    minify: false,
  },
  publicDir: false,
};

/**
 * @typedef {import('vite').UserConfig} UserConfig
 */

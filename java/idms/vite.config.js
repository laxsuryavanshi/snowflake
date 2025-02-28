import path from 'path';
import react from '@vitejs/plugin-react';

/** @type {import('vite').UserConfig} */
export default {
  root: path.resolve(__dirname, 'src/frontend'),
  plugins: [react()],
};

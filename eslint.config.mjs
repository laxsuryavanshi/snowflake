import { defineConfig } from 'eslint/config';

import config from '@turtleby/eslint-config';

export default defineConfig(config, {
  ignores: ['.yarn/*', '.pnp.*', '**/dist/*'],
});

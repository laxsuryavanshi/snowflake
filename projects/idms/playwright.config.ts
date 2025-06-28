import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'yarn build && node server.js',
    port: 3000,
  },
  testDir: 'e2e',
});

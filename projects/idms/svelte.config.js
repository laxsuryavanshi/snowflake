import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ out: 'dist' }),
    csp: {
      mode: 'nonce',
      directives: {
        // https://helmetjs.github.io/#content-security-policy
        'default-src': ['self'],
        'base-uri': ['self'],
        'font-src': ['self', 'https:', 'data:'],
        'form-action': ['self'],
        'frame-ancestors': ['self'],
        'img-src': ['self', 'data:'],
        'object-src': ['none'],
        'script-src': ['self'],
        'script-src-attr': ['none'],
        'style-src': ['self', 'https:', 'unsafe-inline'],
        'upgrade-insecure-requests': true,
      },
      // must be specified with either the `report-uri` or `report-to` directives, or both
      reportOnly: {
        'script-src': ['self'],
        'report-uri': ['/'],
      },
    },
  },
};

export default config;

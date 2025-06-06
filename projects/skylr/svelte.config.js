import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const outputDir = 'dist';

const config = {
  preprocess: vitePreprocess(),
  kit: { adapter: adapter({ pages: outputDir, assets: outputDir }) },
};

export default config;

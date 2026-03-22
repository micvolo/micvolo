import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://micvolo.com',
  adapter: cloudflare({
    imageService: 'compile',
    prerenderEnvironment: 'node',
  }),
  integrations: [sitemap()],
});
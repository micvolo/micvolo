import { defineConfig, sessionDrivers } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://micvolo.com',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [sitemap()],
  session: { driver: sessionDrivers.memory() },
});
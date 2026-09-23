import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://micvolo.com',
  session: false,
  adapter: cloudflare({ imageService: 'compile' }),
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [sitemap({
    filter: (page) => {
      const pathname = new URL(page).pathname;
      return !['/admin', '/portal', '/api', '/documents'].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    },
  })],
});
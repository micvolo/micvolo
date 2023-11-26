import { defineConfig } from 'astro/config';
import swup from '@swup/astro';
import sitemap from "@astrojs/sitemap";

export default defineConfig({
    site: 'https://micvolo.com',
    integrations: [
        sitemap(),
        swup({
            theme: false,
            accessibility: false,
            containers: ['.panel.right'],
        })
    ],
    build: {
        inlineStylesheets: 'never'
    }
});
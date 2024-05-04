import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://micvolo.com',
    vite: {
        build: {
            format: 'file',
        }
    }
});
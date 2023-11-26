import { defineConfig } from 'astro/config';
import swup from '@swup/astro';

export default defineConfig({
    site: 'https://micovlo.me',
    integrations: [
        swup({
            theme: false,
            accessibility: false,
            containers: ['.panel.right'],
        })
    ]
});
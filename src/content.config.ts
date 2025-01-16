import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const settings = defineCollection({
    loader: glob({ pattern: '*.json', base: "src/data/settings" }),
});

const projects = defineCollection({
    loader: glob({ pattern: '*.md', base: "src/data/projects" }),
});

export const collections = { settings, projects };

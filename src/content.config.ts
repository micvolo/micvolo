import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const settings = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/data/settings' }),
  schema: z.object({
    title: z.string(),
    shortDescription: z.string(),
    lede: z.string(),
    hero: z.string(),
    description: z.string(),
    contacts: z.string(),
    header: z.array(z.object({ title: z.string(), link: z.string(), id: z.string() })),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: 'src/data/projects' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string(),
    url: z.string().url().optional(),
    tags: z.string(),
    kind: z.enum(['external', 'native']).default('external'),
    slug: z.string().optional(),
    category: z.enum(['client-work', 'lab', 'experiment', 'game', 'tool']).default('client-work'),
    description: z.string().optional(),
  }),
});

export const collections = { settings, projects };

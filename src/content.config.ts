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

/**
 * Client projects: one JSON file per project at src/data/projects/<slug>.json
 * (the slug is the filename and is never stored in the data) with assets
 * co-located at src/data/projects/<slug>/cover.webp and screen-*.webp.
 * Cover and screens go through image() so Astro optimizes and hashes them.
 */
const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/data/projects' }),
  schema: ({ image }) => {
    /** case note: plain prose or a lead line with a tasteful dash list */
    const noteText = z.union([
      z.string(),
      z.object({ lead: z.string(), items: z.array(z.string()) }).strict(),
    ]);

    /** single landscape: renders full or half width only — never below half */
    const singleScreen = z
      .object({ file: image(), width: z.enum(['full', 'half']), alt: z.string() })
      .strict();

    /** 'grid': 2 landscape side by side · 'pair': 2 portraits · 'quad': 4 portraits (2×2 when narrow) */
    const screenRow = z
      .object({
        layout: z.enum(['grid', 'pair', 'quad']),
        width: z.enum(['full', 'half', 'quarter']),
        row: z.array(z.object({ file: image(), alt: z.string() }).strict()),
      })
      .strict();

    /** one landscape with its note beside it (below when narrow) */
    const screenSplit = z
      .object({
        layout: z.literal('split'),
        width: z.enum(['full', 'half', 'quarter']),
        file: image(),
        alt: z.string(),
        aside: noteText,
      })
      .strict();

    return z
      .object({
        title: z.string(),
        date: z.coerce.date(),
        tags: z.string(),
        /** live site; also drives the case page's "Visit site" button */
        url: z.string().url().optional(),
        /** meta description for the project page */
        description: z.string(),
        /** one-line pitch for the site rail */
        summary: z.string(),
        /** cover for the /projects grid, co-located at ./<slug>/cover.webp */
        cover: image(),
        /** one note rendered before each screen slot, extras close the page */
        notes: z.array(noteText),
        /** screenshot slots interleaved with notes: note, slot, note, slot */
        screens: z.array(z.union([singleScreen, screenRow, screenSplit])),
      })
      .strict();
  },
});

// Identity/slug is the JSON filename (a15.json -> a15) and is never stored in the data.
const labProjects = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/data/lab-projects' }),
  schema: z.object({
    title: z.string(),
    year: z.string(),
    medium: z.string(),
    description: z.string(),
    hue: z.enum(['rose', 'gold', 'lime', 'blue', 'violet', 'cyan']),
  }),
});

export const collections = { settings, projects, labProjects };

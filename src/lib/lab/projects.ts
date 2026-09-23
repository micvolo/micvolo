import { getCollection } from 'astro:content';

export type Project = {
  id: string;
  title: string;
  year: string;
  medium: string;
  description: string;
  hue: 'rose' | 'gold' | 'lime' | 'blue' | 'violet' | 'cyan';
};

// `id` is derived from the entry filename (src/data/lab-projects/<id>.json), never stored in the data.
// Sorted by id so index/prev/next order is deterministic.
export const projects: Project[] = (await getCollection('labProjects'))
  .map((entry) => ({ id: entry.id, ...entry.data }))
  .sort((a, b) => a.id.localeCompare(b.id));

export const projectById = (id: string) => projects.find((project) => project.id === id);

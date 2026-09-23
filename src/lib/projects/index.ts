import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * One project: meta merged with its case content, loaded from the `projects`
 * content collection (src/data/projects/<slug>.json, schema in src/content.config.ts).
 * Image fields arrive as resolved Astro image metadata.
 */
export type Project = CollectionEntry<'projects'>['data'] & {
  /** the JSON filename — the single slug for page routes, asset folders and app icons */
  slug: string;
};

/** case note: plain prose or a lead line with a tasteful dash list */
export type NoteText = Project['notes'][number];

/** screenshot slot: one landscape, a row of them/portraits, or one landscape with a note beside it */
export type ScreenSlot = Project['screens'][number];
type ScreenRowSlot = Extract<ScreenSlot, { row: unknown[] }>;
type ScreenSplitSlot = Extract<ScreenSlot, { aside: NoteText }>;

/** full | half for single landscapes, quarter only for rows and splits */
export type ScreenWidth = ScreenSlot['width'];

export const isRowSlot = (slot: ScreenSlot): slot is ScreenRowSlot => 'row' in slot;
export const isSplitSlot = (slot: ScreenSlot): slot is ScreenSplitSlot => 'aside' in slot;

const withSlug = (entry: CollectionEntry<'projects'>): Project => ({ ...entry.data, slug: entry.id });

/** every project, newest first — the order used by the project grid and the site rail */
export const getProjects = async (): Promise<Project[]> =>
  (await getCollection('projects')).map(withSlug).sort((a, b) => b.date.getTime() - a.date.getTime());

/** one project by slug (the JSON filename), or undefined */
export const getProject = async (slug: string): Promise<Project | undefined> => {
  const entry = (await getCollection('projects')).find((entry) => entry.id === slug);
  return entry ? withSlug(entry) : undefined;
};

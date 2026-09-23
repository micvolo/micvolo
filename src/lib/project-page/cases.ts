export type ScreenWidth = 'full' | 'half' | 'quarter';
/** a single landscape renders full or half width only — never below half */
export type SingleWidth = 'full' | 'half';

/** case note: plain prose or a lead line with a tasteful dash list */
export type NoteText = string | { lead: string; items: string[] };

export interface ProjectScreen {
  /** file name inside src/assets/project-screens/<slug>/ */
  file: string;
  width: SingleWidth;
  alt: string;
}

export interface ProjectScreenRow {
  /** 'grid': 2 landscape side by side · 'pair': 2 portraits · 'quad': 4 portraits (2×2 when narrow) */
  layout: 'grid' | 'pair' | 'quad';
  width: ScreenWidth;
  row: Pick<ProjectScreen, 'file' | 'alt'>[];
}

export interface ProjectSplit {
  /** one landscape with its note beside it (below when narrow) */
  layout: 'split';
  width: ScreenWidth;
  file: string;
  alt: string;
  aside: NoteText;
}

export type ScreenSlot = ProjectScreen | ProjectScreenRow | ProjectSplit;

export const isRowSlot = (slot: ScreenSlot): slot is ProjectScreenRow => 'row' in slot;
export const isSplitSlot = (slot: ScreenSlot): slot is ProjectSplit => 'aside' in slot;

export interface ProjectCase {
  /** projects collection slug and folder name under src/assets/project-screens/ */
  slug: string;
  /** meta description for the project page */
  description: string;
  /** one note rendered before each slot, extras close the page; split slots carry their own aside */
  notes: NoteText[];
  /** screenshot slots interleaved with notes: note, slot, note, slot */
  screens: ScreenSlot[];
}

/**
 * Composition recipe (fixed once built, repeatable for remaining projects):
 * landscape compositions are a single landscape (full or half width) or a 2-up
 * pair of halves — landscapes never render below half the column,
 * text never sits beside images, only above or below (stacked note blocks),
 * portraits appear only as pairs or quads (the quad goes 2×2 when narrow),
 * the page opens with one full-width standalone screenshot after the intro note,
 * every block starts flush on the left edge of the content column,
 * row cells share the first cell's aspect ratio so heights stay equal (no crop),
 * below 721px landscapes stack full width, portrait rows go 2-up / 2×2
 */

/** one module per project under ./cases/, auto-aggregated (default export satisfies ProjectCase) */
const modules = import.meta.glob<ProjectCase>('./cases/*.ts', { eager: true, import: 'default' });

export const projectCases: ProjectCase[] = Object.values(modules);

export const caseFor = (slug: string): ProjectCase | undefined =>
  projectCases.find((projectCase) => projectCase.slug === slug);

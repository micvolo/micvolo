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
export const projectCases: ProjectCase[] = [
  {
    slug: 'abitare-in-legno',
    description:
      'Case notes on the Abitare in Legno site — X-Lam residential storytelling, scroll-driven reveals and a hard rendering budget',
    notes: [
      'Visual direction comes from the studio’s identity work — warm neutrals and one terracotta accent carried over from their print brochure, mapped to two custom properties while everything else stays greyscale',
      'Hero is a single drone plate decoded once into a composited layer and parallaxed at 0,14× scroll speed, while reveal states ride one IntersectionObserver that unobserves after first paint — one layer in, zero reflows and nothing overrunning the 16ms frame',
      'The editorial layout system translates their brochure module straight to CSS grid — 8px rhythm standing in for the 4mm print unit and image plates bleeding full width exactly where the layouts do',
      {
        lead: 'Studio handover, dropped into the web system unchanged',
        items: [
          'wordmark and logo lockups as layered SVG',
          'four floor-plan drawings reused at every breakpoint',
          'brochure colour chips: warm neutrals and one terracotta',
        ],
      },
      'Design reviews ran on shared staging links — two structured rounds of art direction comments from the studio, each closed within the week so mockups and build never drifted apart',
    ],
    screens: [
      { file: 'desktop-01.webp', width: 'full', alt: 'Abitare in Legno desktop home — hero over the Concesio hillside' },
      {
        layout: 'split',
        width: 'half',
        file: 'desktop-02.webp',
        alt: 'Abitare in Legno desktop — apartment detail with gallery carousel',
        aside:
          'Type follows the studio’s print grid — one variable family riding the width axis 88→100 and tracking tightened to −2,5% past 60px so the headline lockup holds at 1440 without reflowing',
      },
      {
        layout: 'grid',
        width: 'full',
        row: [
          { file: 'desktop-03.webp', alt: 'Abitare in Legno desktop — apartment specifications' },
          { file: 'desktop-04.webp', alt: 'Abitare in Legno desktop — residence gallery section' },
        ],
      },
      {
        layout: 'quad',
        width: 'full',
        row: [
          { file: 'mobile-01.webp', alt: 'Abitare in Legno mobile — project intro' },
          { file: 'mobile-02.webp', alt: 'Abitare in Legno mobile — apartment card with feature ledger' },
          { file: 'mobile-03.webp', alt: 'Abitare in Legno mobile — contact and details' },
          { file: 'mobile-04.webp', alt: 'Abitare in Legno mobile — residence overview' },
        ],
      },
      {
        layout: 'split',
        width: 'half',
        file: 'desktop-05.webp',
        alt: 'Abitare in Legno desktop — project data section',
        aside:
          'Client approved the first end-to-end pass and settled copy questions in days — since launch the team publishes apartment data through the CMS on their own with no design escalations',
      },
    ],
  },
  {
    slug: 'apr-instruments',
    description:
      'Case notes on the APR Instruments storefront — custom Shopify theme layer, WebGL magnification viewer and a keyboard-first interaction model',
    notes: [
      'Art direction comes from the studio’s rebrand — clinical white base with a single instrument-blue accent lifted from their spec sheets, wired as one custom property with greyscale carrying the rest',
      'The Microcamera viewer interpolates four captured magnification steps through WebGL texture blending instead of shipping video — 2,1MB of payload carries the whole interaction',
      'Mega menu and product tables follow the studio’s 12-column print catalogue grid — gutters locked at 24px to match their PDF so photography lines up across both mediums',
      {
        lead: 'What the studio handed over, reused untouched',
        items: [
          'logo lockups in three weights, exported as SVG',
          'lens diagrams as layered vector files',
          'icon set and a written type spec with tracking tables',
        ],
      },
      'Design handoff ran against a staging storefront on the custom Shopify theme layer — three focused feedback rounds with the studio, art direction notes resolved per page and the approved state frozen before the catalogue import',
    ],
    screens: [
      { file: 'desktop-01.webp', width: 'full', alt: 'APR Instruments desktop home — hero with instrument line-up' },
      {
        layout: 'split',
        width: 'half',
        file: 'desktop-02.webp',
        alt: 'APR Instruments desktop — technology overview',
        aside:
          'Display type is their brand grotesk self-hosted as a two-axis variable file — weight 650 in the wordmark and −1,5% tracking from 48px up so the hero reads like the brochure',
      },
      {
        layout: 'grid',
        width: 'full',
        row: [
          { file: 'desktop-03.webp', alt: 'APR Instruments desktop — product presentation' },
          { file: 'desktop-04.webp', alt: 'APR Instruments desktop — technology section' },
        ],
      },
      {
        layout: 'quad',
        width: 'full',
        row: [
          { file: 'mobile-01.webp', alt: 'APR Instruments mobile — audience segments' },
          { file: 'mobile-02.webp', alt: 'APR Instruments mobile — Microcamera showcase' },
          { file: 'mobile-03.webp', alt: 'APR Instruments mobile — product and footer view' },
          { file: 'mobile-04.webp', alt: 'APR Instruments mobile — catalogue browsing' },
        ],
      },
      {
        layout: 'split',
        width: 'half',
        file: 'desktop-05.webp',
        alt: 'APR Instruments desktop — catalogue overview',
        aside:
          'Client signed off the first end-to-end walkthrough and decides variant questions within the week — daily catalogue work since runs through the CMS without design escalations',
      },
    ],
  },
];

export const caseFor = (slug: string): ProjectCase | undefined =>
  projectCases.find((projectCase) => projectCase.slug === slug);

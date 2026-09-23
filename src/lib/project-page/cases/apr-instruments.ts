import type { ProjectCase } from '../cases';

export default {
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
} satisfies ProjectCase;

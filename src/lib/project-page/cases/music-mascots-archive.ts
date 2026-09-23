import type { ProjectCase } from '../cases';

export default {
  slug: 'music-mascots-archive',
  description:
    'Case notes on the Music Mascots Archive — a faceted catalogue of record-cover characters with credit ledgers and a hard scan budget',
  notes: [
    'Art direction follows the curator’s own book — flat white ground, one black grotesk, and colour left entirely to the scanned covers so the interface never fights forty years of loud record artwork',
    'The archive runs one indexed facet query — name, project, nature, role, technique, application and genre compose into a single request, and each card’s credit ledger repaints from the same payload with zero extra round trips',
    'Grid follows their printed catalogue layout — four plates per row on desktop, ledger locked underneath at 9ch label width, so a one-line credit and a nine-line one still drop the next row on the same baseline',
    {
      lead: 'Studio handover, wired straight into the build',
      items: [
        'wordmark and both display cuts as layered SVG',
        'cover scans at 2400px with their ICC profiles baked in',
        'the eight-column credit ledger lifted from the book layouts',
      ],
    },
    'Reviews ran on a staging link seeded with 400 real entries — three art-direction passes with the studio, each closed within days, so sort logic and plate ratios never drifted from the mockups',
    'Client approved the first full walkthrough and settled the taxonomy in a week — since launch the archive is curated through the CMS alone, past 900 entries now, and no design escalations',
  ],
  screens: [
    { file: 'desktop-01.webp', width: 'full', alt: 'Music Mascots Archive desktop — home with the wordmark, facet bar and first cover row' },
    {
      layout: 'grid',
      width: 'full',
      row: [
        { file: 'desktop-02.webp', alt: 'Music Mascots Archive desktop — cover row with Slayer, a Bat Out of Hell plate and Gorilla Biscuits' },
        { file: 'desktop-03.webp', alt: 'Music Mascots Archive desktop — cover row with Aksak and Demilich plates and the Sublime Lou Dog badge' },
      ],
    },
    {
      layout: 'split',
      width: 'half',
      file: 'desktop-04.webp',
      alt: 'Music Mascots Archive desktop — cover row with His Master’s Voice, Atrax and the Ramones seal',
      aside:
        'Facet bar is one sticky row of native selects restyled to pills — keyboard order matches visual order, the active facet count is announced to screen readers, and nothing collapses into a drawer until 480px',
    },
    {
      layout: 'quad',
      width: 'full',
      row: [
        { file: 'mobile-01.webp', alt: 'Music Mascots Archive mobile — Minor Threat plate with its credit ledger' },
        { file: 'mobile-02.webp', alt: 'Music Mascots Archive mobile — Shaka Ponk GOZ mascot render' },
        { file: 'mobile-03.webp', alt: 'Music Mascots Archive mobile — Sublime Lou Dog badge entry' },
        { file: 'mobile-04.webp', alt: 'Music Mascots Archive mobile — Rude Boy Records 45 label plate' },
      ],
    },
    { file: 'desktop-05.webp', width: 'half', alt: 'Music Mascots Archive desktop — cover row with Grateful Dead, Bad Religion and Genghis Kittie' },
  ],
} satisfies ProjectCase;

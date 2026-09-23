import type { ProjectCase } from '../cases';

export default {
  slug: 'flavio-nani',
  description:
    'Case notes on the Flavio Nani site — reel-grade stills, a fixed-height services stack and the studio’s capabilities deck translated to the web',
  notes: [
    'Art direction follows the studio’s own reel brand — paper-white ground, ink-black type and one full-bleed still per section, colour grading carried over untouched from the film masters so site and reel match frame for frame',
    {
      lead: 'What the studio handed over, reused as delivered',
      items: [
        'reel stills at full resolution with their grading LUTs',
        'wordmark in two lockups, exported as SVG',
        'client logo set as monochrome vectors',
      ],
    },
    'Work stills decode at their display size and share one aspect ratio per row — pairs hold equal height with no crop, and the strip below the fold preloads one row ahead so the grid never pops in empty',
    'Service rows expand to fixed-height panels behind one disclosure group — zero layout shift on open — and below 721px the whole block collapses to a plain stacked list',
    'The About spread translates their capabilities deck one to one — four columns, 8px rhythm standing in for the 4mm print unit, hairline rules instead of boxes so the pages stay flat on the paper-white ground',
    'Reviews ran on shared staging links with the studio — two rounds of art-direction notes closed inside the week — and Flavio signed the first walkthrough, swapping showreel stills through the CMS himself since launch',
  ],
  screens: [
    { file: 'desktop-01.webp', width: 'full', alt: 'Flavio Nani desktop home — showreel hero still' },
    {
      layout: 'quad',
      width: 'full',
      row: [
        { file: 'mobile-01.webp', alt: 'Flavio Nani mobile — home hero still' },
        { file: 'mobile-02.webp', alt: 'Flavio Nani mobile — selected work stills' },
        { file: 'mobile-03.webp', alt: 'Flavio Nani mobile — selected brands' },
        { file: 'mobile-04.webp', alt: 'Flavio Nani mobile — contact details' },
      ],
    },
    { file: 'desktop-05.webp', width: 'half', alt: 'Flavio Nani desktop — work grid of reel stills' },
    {
      layout: 'split',
      width: 'half',
      file: 'desktop-04.webp',
      alt: 'Flavio Nani desktop — service rows with descriptions',
      aside:
        'Type is the studio’s brand grotesk self-hosted as a two-axis variable — weight 700 on the section anchors and −1,5% tracking from 48px up, so the services list reads like the printed capabilities deck',
    },
    {
      layout: 'grid',
      width: 'full',
      row: [
        { file: 'desktop-02.webp', alt: 'Flavio Nani desktop — about spread with the production statement' },
        { file: 'desktop-03.webp', alt: 'Flavio Nani desktop — services overview' },
      ],
    },
  ],
} satisfies ProjectCase;

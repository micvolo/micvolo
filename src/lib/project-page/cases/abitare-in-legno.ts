import type { ProjectCase } from '../cases';

export default {
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
} satisfies ProjectCase;

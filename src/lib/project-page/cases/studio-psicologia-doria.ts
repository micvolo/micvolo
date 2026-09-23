import type { ProjectCase } from '../cases';

export default {
  slug: 'studio-psicologia-doria',
  description:
    'Case notes on the Studio di psicologia Doria site — growth-stage plant illustrations, pastel service cards and a serif italic voice carried from the studio’s identity',
  notes: [
    'Art direction comes from Stra Studio’s identity for the clinic — one herbarium green and deep navy on warm paper, with the growth-stage plants drawn as three line-art SVGs so the hero carries the whole metaphor without a single stock photo',
    'Service cards each take their fill and border from the identity chips — cream for assessments, leaf for rehabilitation, sky for psychotherapy — 2px rules, a 1,5rem corner and a degree or two of tilt that flattens on hover so the row reads as pinned notes rather than a grid',
    'Interior photography keeps the 1,4:1 frames from the studio’s brochure and wears the same 2px green border as the cards — the layout trusts the rooms themselves, which is exactly what a family scanning for a safe space needs to see',
    {
      lead: 'Mobile behaviour, locked against the studio’s motion tests',
      items: [
        'the three plants cycle on a 2,4s loop so the growth stages read one at a time',
        'service cards become a scroll-snap carousel at one card per screen',
        'the serif italic claim keeps its stroke contrast down to 320px with no synthetic weights',
      ],
    },
    'I nostri spazi runs one continuous marquee of clinic rooms at a fixed height so the section never reflows — it stops on hover, freezes under prefers-reduced-motion and every room photo stays a plain image with real alt text',
    'Design handoff ran on shared staging with Stra Studio — two structured rounds of art direction comments, card tilt and type sizes settled per section and the approved state frozen before the clinic wrote a word of copy',
    'Client approved the first full walkthrough in one sitting and settles copy questions within days — since launch the equipe publishes service copy and staff notes through the CMS on their own and the site still matches the brochure',
  ],
  screens: [
    { file: 'desktop-01.webp', width: 'full', alt: 'Studio di psicologia Doria desktop home — serif italic claim with the three growth-stage plants' },
    {
      layout: 'grid',
      width: 'full',
      row: [
        { file: 'desktop-02.webp', alt: 'Studio di psicologia Doria desktop — service cards for assessments, rehabilitation and psychotherapy' },
        { file: 'desktop-04.webp', alt: 'Studio di psicologia Doria desktop — tilted service cards above the space photography' },
      ],
    },
    {
      layout: 'split',
      width: 'half',
      file: 'desktop-03.webp',
      alt: 'Studio di psicologia Doria desktop — space photography and the Come Lavoriamo method section',
      aside:
        'Type is the studio’s two-voice pairing — a transitional serif italic for every claim with optical sizing turned on, so the hero holds its stroke contrast at 72px while the body copy stays quiet at 17px',
    },
    {
      layout: 'quad',
      width: 'full',
      row: [
        { file: 'mobile-01.webp', alt: 'Studio di psicologia Doria mobile — hero claim with a growth-stage plant and the Chi Siamo intro' },
        { file: 'mobile-02.webp', alt: 'Studio di psicologia Doria mobile — service cards in the snap carousel' },
        { file: 'mobile-03.webp', alt: 'Studio di psicologia Doria mobile — space photos and the method section' },
        { file: 'mobile-04.webp', alt: 'Studio di psicologia Doria mobile — method copy and the I nostri spazi marquee' },
      ],
    },
    { file: 'desktop-05.webp', width: 'half', alt: 'Studio di psicologia Doria desktop — method copy and the I nostri spazi photo marquee' },
  ],
} satisfies ProjectCase;

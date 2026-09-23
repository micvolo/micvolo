import type { ProjectCase } from '../cases';

export default {
  slug: 'ea-kahane',
  description:
    'Case notes on the E.A. Kahane site — poster-scale display type, numbered book rows and a press ledger the artist keeps current',
  notes: [
    'Art direction runs on the Stra Studio identity — acid yellow, ink black and one off-white and nothing else, with the display grotesk set oversized and cropped at the viewport edge like the exhibition posters',
    'Mobile keeps the poster logic — the name marquee stacks as pure type on the yellow field and each numbered book row holds one per screen so the rhythm matches the printed programme',
    'Bio and the MO.CA portrait reveal on one IntersectionObserver that unobserves after first paint — opacity only, no transforms, so the caption and the More About pill never move',
    'The books surface as numbered rows 01 to 04 — title, subtitle and cover plate with the ratio reserved up front, so the index reads like the checklist she prints for openings',
    {
      lead: 'Stra Studio handover, wired in unchanged',
      items: [
        'the condensed grotesk as one licensed cut',
        'yellow, black and off-white chips with AA pairs tested',
        'the numbered-row grammar from her printed programme',
      ],
    },
    'News and press run as one ruled ledger in tabular figures — she keeps it current herself, and the contact block is underline fields with a plain confirmation line, no modal',
    'Light boxes, murals and silk screens needed the same presence as the shows — plates bleed at exhibition scale and the interface stays still, the work does the moving',
    'Elizabeth publishes new openings and press from the road and writes in her own voice — the studio joins for art direction passes only, which is exactly how she wanted the relationship to run',
  ],
  screens: [
    { file: 'desktop-01.webp', width: 'full', alt: 'E.A. Kahane desktop home — the E.A.KAHANE lockup on the acid yellow hero' },
    {
      layout: 'pair',
      width: 'full',
      row: [
        { file: 'mobile-01.webp', alt: 'E.A. Kahane mobile — the repeated name lockup stacked on yellow' },
        { file: 'mobile-02.webp', alt: 'E.A. Kahane mobile — biography with the portrait in the red jacket' },
      ],
    },
    {
      layout: 'split',
      width: 'half',
      file: 'desktop-02.webp',
      alt: 'E.A. Kahane desktop — biography with the MO.CA Brescia portrait',
      aside:
        'Display type is the studio’s condensed grotesk at weight 800 with −2% tracking, sized in clamp() so the lockup crops identically at 1440 and at 390 — one cut, three volumes of shout',
    },
    {
      layout: 'grid',
      width: 'full',
      row: [
        { file: 'desktop-03.webp', alt: 'E.A. Kahane desktop — Current Work: numbered book rows with Mille Miglia plates' },
        { file: 'desktop-04.webp', alt: 'E.A. Kahane desktop — News and Press: the dated ledger and outlet tiles' },
      ],
    },
    {
      file: 'desktop-05.webp',
      width: 'half',
      alt: 'E.A. Kahane desktop — Front Row Seat with the parade plates and View All Projects',
    },
    {
      layout: 'quad',
      width: 'full',
      row: [
        { file: 'mobile-03.webp', alt: 'E.A. Kahane mobile — Current Work rows for Heart of the Race and Come Join the Parade' },
        { file: 'mobile-04.webp', alt: 'E.A. Kahane mobile — Front Row Seat with the Mille Miglia plate' },
        { file: 'mobile-05.webp', alt: 'E.A. Kahane mobile — parade plates over the news ledger' },
        { file: 'mobile-06.webp', alt: 'E.A. Kahane mobile — Stay in Touch with the portrait from the parade' },
      ],
    },
  ],
} satisfies ProjectCase;

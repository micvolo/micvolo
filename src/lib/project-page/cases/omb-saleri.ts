import type { ProjectCase } from '../cases';

export default {
  slug: 'omb-saleri',
  description:
    'Case notes on the Omb Saleri group site — a WebGL valve hero, four division colours and an institutional site the marketing office runs alone',
  notes: [
    'Art direction comes from the studio’s rebrand for the group — cold industrial greys with four saturated division colours, each lifted from a real valve housing and wired to exactly one custom property',
    'The hero is one WebGL scene — forklift, truck, car and aircraft assemblies share a single GLB, and the Shader/Wireframe pill swaps materials live instead of loading a second model',
    'Mobile keeps the division cards as one snap-scrolling row — the colour coding survives at 390px because each card is a custom property and a two-line summary, not a cropped desktop panel',
    {
      lead: 'What the studio handed over, dropped in unchanged',
      items: [
        'division chips: hydrogen blue, CNG orange, aerospace purple, IBU green',
        'valve assemblies as one Draco-compressed GLB',
        'facility photography cropped to the brochure module',
      ],
    },
    'Copy and art direction cleared in two review rounds on staging — the vision statement reflows from their annual-report grid, and the partners row is the only logo strip on the whole site',
    'Client’s marketing office publishes news, tender notices and the download library through the CMS — running solo since launch, zero design escalations, and a genuinely happy comms team',
  ],
  screens: [
    { file: 'desktop-01.webp', width: 'full', alt: 'Omb Saleri desktop — hero with 3D transport renders and the shader toggle' },
    {
      layout: 'split',
      width: 'half',
      file: 'desktop-02.webp',
      alt: 'Omb Saleri desktop — company profile with the production lab photo',
      aside:
        'Text runs on their corporate grotesk at 18/30 with a 62ch measure — pulled straight from the sustainability report so the site and the printed documents share one ink colour',
    },
    {
      layout: 'quad',
      width: 'full',
      row: [
        { file: 'mobile-01.webp', alt: 'Omb Saleri mobile — hero with the vehicle renders' },
        { file: 'mobile-02.webp', alt: 'Omb Saleri mobile — Hydrogen division card with the valve CTA' },
        { file: 'mobile-03.webp', alt: 'Omb Saleri mobile — Benefit Company mission text' },
        { file: 'mobile-04.webp', alt: 'Omb Saleri mobile — get in touch, partners and tender rows' },
      ],
    },
    { file: 'desktop-03.webp', width: 'full', alt: 'Omb Saleri desktop — four division cards above the R&D facilities list' },
    {
      layout: 'grid',
      width: 'full',
      row: [
        { file: 'desktop-04.webp', alt: 'Omb Saleri desktop — vision statement with factory aerials' },
        { file: 'desktop-05.webp', alt: 'Omb Saleri desktop — contacts, partners and tender notice' },
      ],
    },
  ],
} satisfies ProjectCase;

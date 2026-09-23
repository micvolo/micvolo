import type { ProjectCase } from '../cases';

export default {
  slug: 'origami',
  description:
    'Case notes on the Origami project site — one coral fold mark, an accordion research directory and eight partner identities kept in their original colours',
  notes: [
    'Art direction comes from the consortium’s identity — one origami-fold mark in coral orange on white, peach as the only secondary tint, and partner logos left in their original colours on purpose',
    'The partner directory is one accordion of eight rows — opens on a grid-template-rows transition at 220ms, and the whole directory ships about 3KB of script',
    'The abstract quote and the directory read from one content collection keyed by partner — adding a ninth institution is a CMS entry, never a layout change',
    {
      lead: 'Studio handover, reused without redraws',
      items: [
        'the fold mark as layered SVG behind one coral token',
        'partner logos exactly as supplied, inconsistent masters and all',
        'the peach tint sampled from their project folder',
      ],
    },
    'Two review rounds with the coordinators in Milan — art-direction notes per page, resolved within the week, and the logo wall got one hairline grid instead of eight floating boxes',
    'Client signed off the first walkthrough and the consortium has published reports and conference news through the CMS since — one satisfied research office, no design escalations',
  ],
  screens: [
    { file: 'desktop-01.webp', width: 'full', alt: 'Origami desktop — hero with the coral fold mark and the project title' },
    {
      layout: 'quad',
      width: 'full',
      row: [
        { file: 'mobile-01.webp', alt: 'Origami mobile — hero fold shapes with the mission line' },
        { file: 'mobile-02.webp', alt: 'Origami mobile — abstract quote tail and the partners heading' },
        { file: 'mobile-03.webp', alt: 'Origami mobile — partner rows with city and country' },
        { file: 'mobile-04.webp', alt: 'Origami mobile — partner logos with the Origami wordmark' },
      ],
    },
    {
      layout: 'grid',
      width: 'full',
      row: [
        { file: 'desktop-02.webp', alt: 'Origami desktop — research abstract quote block from the Origami team' },
        { file: 'desktop-03.webp', alt: 'Origami desktop — research partners directory, first rows' },
      ],
    },
    {
      layout: 'split',
      width: 'half',
      file: 'desktop-04.webp',
      alt: 'Origami desktop — research partners directory with the start exploring button',
      aside:
        'Headings mix roman and italic cuts of one grotesk — the orange word inside the black line is their print device, carried over at fixed 400 and 650 weights with −1% tracking from 40px',
    },
    { file: 'desktop-05.webp', width: 'half', alt: 'Origami desktop — partner logo wall and footer band' },
  ],
} satisfies ProjectCase;

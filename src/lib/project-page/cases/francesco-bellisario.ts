import type { ProjectCase } from '../cases';

export default {
  slug: 'francesco-bellisario',
  description:
    'Case notes on the Francesco Bellisario site — poster-driven art direction, a pinned horizontal slide deck and filmstrips scrubbed on one timeline',
  notes: [
    'Art direction is pure poster logic from the graphic studio — one acid ground, one clashing display colour at poster scale and no chrome anywhere — the pair reshuffles per visit from their palette matrix so no two loads read the same',
    'The deck is one pinned GSAP timeline — six horizontal slides scrubbed at 1,4× scroll speed, each chapter resolving from a filmstrip that translates on the same progress curve, so one scroll gesture drives every layer with zero reflows',
    {
      lead: 'Handover from the graphic studio, used as delivered',
      items: [
        'display face as a variable font with the poster tracking baked in',
        'palette matrix: acid grounds crossed with clashing display colours',
        'film stills cut to the deck’s fixed cells',
      ],
    },
    'Each chapter strip holds its stills at native ratio and decodes only the frames nearest the viewport — the deck holds 60fps even on the mid-range Android that Francesco checks the site on',
    'Credits sit as plain text columns beside every filmstrip — no cards, no modals — because for a filmmaker the end-credit block is part of the page',
    'Reviews ran as timestamped screen recordings with the graphic studio — two rounds of type and colour notes — and Francesco approved the deck in the first walkthrough, adding new film stills through the CMS himself since, with zero design escalations',
  ],
  screens: [
    { file: 'desktop-01.webp', width: 'full', alt: 'Francesco Bellisario desktop home — poster hero with the display title' },
    {
      layout: 'grid',
      width: 'full',
      row: [
        { file: 'desktop-02.webp', alt: 'Francesco Bellisario desktop — Big Tree Studio chapter with filmstrip and credits' },
        { file: 'desktop-03.webp', alt: 'Francesco Bellisario desktop — Don Giovanni di Maclino chapter' },
      ],
    },
    {
      layout: 'quad',
      width: 'full',
      row: [
        { file: 'mobile-01.webp', alt: 'Francesco Bellisario mobile — poster hero' },
        { file: 'mobile-02.webp', alt: 'Francesco Bellisario mobile — Big Tree Studio chapter' },
        { file: 'mobile-03.webp', alt: 'Francesco Bellisario mobile — OBDXporter chapter' },
        { file: 'mobile-04.webp', alt: 'Francesco Bellisario mobile — credits and contacts' },
      ],
    },
    {
      layout: 'split',
      width: 'half',
      file: 'desktop-04.webp',
      alt: 'Francesco Bellisario desktop — Due Passanti chapter',
      aside:
        'The numbered rail doubles as scroll progress — one counter in tabular figures driven from the timeline’s progress callback, so index and slide can never desync',
    },
    { file: 'desktop-05.webp', width: 'half', alt: 'Francesco Bellisario desktop — OBDXporter chapter' },
  ],
} satisfies ProjectCase;

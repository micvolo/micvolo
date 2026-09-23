import type { ProjectCase } from '../cases';

export default {
  slug: 'laura-baresi',
  description:
    'Case notes on the Laura Baresi storefront — drop-campaign art direction, poster-frame Shopify theme and a scroll-driven product story',
  notes: [
    'Art direction is the studio’s drop-campaign system — poster frames in flat pink, green and yellow with one ultra-heavy display face, each line colour-coded so CHUNKY®, FONZIE and HOOK read as separate drops without a single product card',
    'Hero frames pin and cross-fade on scroll — one sticky stage swapping layered type and product cut-outs in step with scroll position, 60fps on an iPhone 12 and never more than eight composited layers',
    {
      lead: 'What the studio handed over, reused as-is',
      items: [
        'logo lockups in three weights, exported as SVG',
        'product cut-outs as masked PNGs at 2×',
        'campaign palette per drop: pink, yellow and green',
      ],
    },
    'Storefront runs on a custom Shopify theme layer — the shipping ticker, press logo row and category ribbon are one section schema, so merchandising reorders drops from the admin without ever touching layout or code',
    'Type is the studio’s campaign cut of a fat grotesk — 22vw with −3% tracking so the lockup kisses the frame edge and the product cut-outs slot between the letterforms, stepping to a fixed 64px on mobile so words never break mid-frame',
    'Client approved the first end-to-end walkthrough and answers merchandising questions within the week — daily drop management since runs through Shopify with no design escalations',
  ],
  screens: [
    { file: 'desktop-01.webp', width: 'full', alt: 'Laura Baresi desktop home — blue Chunky® beanie over the campaign lockup' },
    {
      layout: 'split',
      width: 'half',
      file: 'desktop-02.webp',
      alt: 'Laura Baresi desktop — Fonzie drop frame in campaign yellow',
      aside:
        'Every drop frame is composed in the browser, not in a raster file — the display word sits behind the product cut-out on its own layer, so recolouring a campaign is one custom property and a re-export of the cut-out',
    },
    {
      layout: 'quad',
      width: 'full',
      row: [
        { file: 'mobile-01.webp', alt: 'Laura Baresi mobile — Chunky® drop hero with the blue beanie' },
        { file: 'mobile-02.webp', alt: 'Laura Baresi mobile — Hook drop with the orange beanie' },
        { file: 'mobile-03.webp', alt: 'Laura Baresi mobile — We Love Animals campaign copy with the doll cut-outs' },
        { file: 'mobile-04.webp', alt: 'Laura Baresi mobile — Pet Sales and Gomitoli Unisex illustrated panels' },
      ],
    },
    {
      file: 'desktop-03.webp',
      width: 'half',
      alt: 'Laura Baresi desktop — Hook drop with the orange beanie and the press logo row',
    },
    {
      layout: 'grid',
      width: 'full',
      row: [
        { file: 'desktop-04.webp', alt: 'Laura Baresi desktop — category ribbon in campaign yellow on green' },
        { file: 'desktop-05.webp', alt: 'Laura Baresi desktop — Gomitoli Unisex panel with the yarn illustration' },
      ],
    },
  ],
} satisfies ProjectCase;

# MICVOLO — DESIGN SYSTEM

```
███╗   ███╗██╗ ██████╗██╗   ██╗ ██████╗ ██╗      ██████╗
████╗ ████║██║██╔════╝██║   ██║██╔═══██╗██║     ██╔═══██╗
██╔████╔██║██║██║     ██║   ██║██║   ██║██║     ██║   ██║
██║╚██╔╝██║██║██║     ╚██╗ ██╔╝██║   ██║██║     ██║   ██║
██║ ╚═╝ ██║██║╚██████╗ ╚████╔╝ ╚██████╔╝███████╗╚██████╔╝
╚═╝     ╚═╝╚═╝ ╚═════╝  ╚═══╝   ╚═════╝ ╚══════╝ ╚═════╝
                                            DESIGN SYSTEM v1
```

> **Michele Volonghi** · Digital partner · Brescia (IT) · Remote

---

## TABLE OF CONTENTS

1. [Brand Identity](#1-brand-identity)
2. [Brand Copy](#1b-brand-copy)
3. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Background Shader](#5-background-shader)
6. [Components](#6-components)
7. [Animations & Transitions](#7-animations--transitions)
8. [Content System](#8-content-system)
9. [Data Model & CMS](#9-data-model--cms)
10. [SEO & Meta](#10-seo--meta)
11. [Adding New Sections](#11-adding-new-sections)

---

## 1. BRAND IDENTITY

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NAME      Michele Volonghi
  HANDLE    @micvolo
  URL       micvolo.com
  STUDIO    stra.studio
  LOCATION  Brescia (IT) — Remote worldwide
  ROLE      Digital partner — developer & designer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Pillars

| Pillar | Expression |
|--------|-----------|
| **Partner** | 5+ years building real products — not just delivery |
| **Speed** | Blazingly fast — performance is a feature |
| **Design** | Bold, distinctive — never generic |
| **Craft** | Typography · Shaders · Interaction · Smooth animations |
| **Ownership** | Clients can manage their own content |

### Voice & Tone

- **Bold** — no hedging, no corporate speak
- **Minimal** — say it once, say it right
- **Pragmatic** — focus on what works, not what's trendy
- **Confident** — "blazingly", "crazy" are intentional brand words

---

## 1B. BRAND COPY

The actual text on the site. Both fields live in `settings.json` and are editable via CMS.

### Hero (left panel — top, uppercase, pre-line)

> The services + identity list. First thing you read.

```
5+ years.
Real products.
Real clients.

Digital marketing.
Web design. Branding.
E-commerce. 3D.
Shaders. Interaction.
Smooth animations.

Independent creative developer
& designer.

Brescia (IT) · Remote.
```

### Description (left panel — bottom, right-aligned)

> The positioning + pricing statement. Italic tags use the slant axis.

```
Your digital partner.
Not just a developer.

Specialized in
blazingly fast websites
with crazy designs

that clients can easily
manage themselves.

The machine serves.
The human decides.

€40 / hour. Pragmatic.

Text me on WhatsApp    ← underlined link → https://wa.me/393317043898
```

### Rules for writing copy

| Rule | Example |
|------|---------|
| Short lines, line breaks as rhythm | `Real products.\nReal clients.` |
| No full sentences — fragments only | `Not just a developer.` not `I am not just a developer.` |
| Use `<i>` for emphasis (slant axis) | `<i>blazingly</i>` `<i>Pragmatic.</i>` |
| Price is always explicit | `€40 / hour.` — never hidden or approximate |
| End with one-word punch | `Pragmatic.` `Balanced.` `Clean.` |

---

## 2. COLOR SYSTEM

The palette is defined as CSS custom properties on `:root` and consumed directly by the WebGL shader as uniforms.

```scss
:root {
  --bg1: rgb(255, 255, 229);   /* CREAM */
  --bg2: rgb(255, 113, 66);    /* ORANGE */
  --bg3: rgb(61,  66,  148);   /* INDIGO */
  --color: rgba(255, 255, 255, 0.9); /* TEXT */
}
```

### Palette

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ██████  #FFFFE5   --bg1   CREAM                            │
│  (255, 255, 229)           Cool highlight / gradient light  │
│                                                             │
│  ██████  #FF7142   --bg2   ORANGE                           │
│  (255, 113, 66)            Accent / selection / glow        │
│                                                             │
│  ██████  #3D4294   --bg3   INDIGO                           │
│  (61, 66, 148)             Base background / text shadow    │
│                                                             │
│  ██████  rgba(255,255,255,0.9)  --color  TEXT               │
│                            All body text                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Usage Rules

| Token | Where used |
|-------|-----------|
| `--bg1` | Shader gradient light pole (cream highlight) |
| `--bg2` | Shader gradient warm pole (orange glow) · `::selection` background |
| `--bg3` | HTML background · right panel fill · text shadow · nav hover glow |
| `--color` | All text · borders · dividers |

### Selection

```css
::selection {
  background: var(--bg2); /* Orange selection highlight */
}
```

### Text Shadow (Global)

```css
text-shadow: 0 0 4px var(--bg3);
```

Applied globally to all text — creates the subtle "bloom against the shader" effect.

---

## 3. TYPOGRAPHY

> **The typography is the soul of the visual identity.**
> Mona Sans variable font + the WebGL shader are the two defining elements of this site.
> Everything else supports them.

### Typeface — Mona Sans (Variable)

```
File:    /public/fonts/monasans.woff2
Format:  woff2 (variable font, weight range 100–1000)
Source:  GitHub Mona Sans — github.com/github/mona-sans
```

```css
@font-face {
  font-family: monasans;
  src: url("/fonts/monasans.woff2") format("woff2");
  font-weight: 100 1000;
  font-display: block;
}
```

### Variable Font Axes

| Axis | Tag | Range | Description |
|------|-----|-------|-------------|
| Width | `wdth` | 50–125 | Condensed ← Normal → Extended |
| Weight | `wght` | 100–900 | Thin → Black |
| Slant | `slnt` | -15–0 | Upright → Oblique |
| Optical Size | `opsz` | 14–32 | Fine-tune spacing at small/large sizes |

```css
/* Default body — slightly condensed, semibold */
font-variation-settings: "wdth" 92, "wght" 600, "opsz" 20;

/* Page titles — very condensed */
font-variation-settings: "wdth" 50, "wght" 600, "opsz" 20;

/* Italic-style variant (no actual italic axis — uses slant) */
font-style: normal;
font-variation-settings: "wdth" 92, "wght" 600, "slnt" -12;
```

### Global Defaults

```css
font-family: monasans, sans-serif;
font-feature-settings: "ss01" on;   /* Stylistic set 1 (round punctuation) */
font-variation-settings: "wdth" 92, "wght" 600, "opsz" 20;
line-height: 1;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

### Type Scale

```
┌────────────────────────────────────────────────────────────────────┐
│  ROLE               SIZE                    VAR SETTINGS           │
├────────────────────────────────────────────────────────────────────┤
│  Site name (H1)     clamp(1rem, 8vw, 2rem)  default               │
│  Nav items          clamp(2rem, 10vw, 4rem) default               │
│  Hero / subhero     1rem                    default (uppercase)    │
│  Page title         clamp(2rem, 5vw, 3rem)  wdth 50               │
│  Project card title clamp(1.8rem, 6vw, 2.5rem) wdth 92, wght 600 │
│  Project tags       clamp(0.6rem, 6vw, 0.8rem) uppercase          │
│  Body / content     clamp(1rem, 3vw, 1.1rem)   wdth 92, wght 400 │
│  Contact links      1.5rem                   underline            │
└────────────────────────────────────────────────────────────────────┘
```

### Inline Italic

The `<i>` tag is repurposed — it uses the slant axis, not a different font file:

```scss
:global(i) {
  font-style: normal;
  font-variation-settings: "wdth" 92, "wght" 600, "slnt" -12;
}
```

Usage in CMS content: `<i>blazingly</i>` → renders as slanted Mona Sans.

### Text Utilities

| Class/Rule | Effect |
|-----------|--------|
| `text-transform: uppercase` | Used on subhero, project tags, page titles |
| `white-space: pre-line` | Preserves newlines in hero/description text (set in settings.json) |
| `user-select: none` | Global — prevents accidental selection |
| `user-select: text` | Re-enabled on `h1–h6, p` |
| `pointer-events: none` | On `.subhero` — text is decorative |

---

## 4. SPACING & LAYOUT

### Base Unit

```scss
--padding: 0.5rem;          /* 8px — base unit for all UI spacing */
--padding2: calc(var(--padding) * 8);   /* 4rem — content padding (desktop) */

/* Mobile override (max-width: 64rem) */
--padding2: calc(var(--padding) * 4);   /* 2rem */
```

### Breakpoint

```scss
$breakpoint: 64rem; /* 1024px */

@media (max-width: 64rem) { /* mobile */ }
```

### Split Panel Layout

```
┌──────────────────────────────────────────────────────┐
│  <main>  display:flex  height:100vh/100svh            │
│  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │   .panel.left   │  │      .panel.right         │   │
│  │   flex-basis:   │  │   flex-basis: 0% → 300%   │   │
│  │   100%          │  │   transform: translateX   │   │
│  │                 │  │   (100%) → (0%)           │   │
│  │   LeftPanel     │  │                           │   │
│  │   - name        │  │   RightPanel              │   │
│  │   - hero text   │  │   - <slot />              │   │
│  │   - description │  │   - projects page         │   │
│  │   - menu / nav  │  │   - future pages          │   │
│  └─────────────────┘  └──────────────────────────┘   │
└──────────────────────────────────────────────────────┘

Mobile: display:block, stacked vertically, overflow:visible
```

### Panel States

```
State: index page (/)
  .panel.left  → class="panel left open"   (min-height: 100vh)
  .panel.right → class="panel right"       (hidden, flex-basis: 0)

State: any other page (/projects, etc.)
  .panel.left  → class="panel left"        (collapsed)
  .panel.right → class="panel right open"  (flex-basis: 300%)
```

### Right Panel Container

```scss
.container {
  width: calc(75vw - var(--padding));   /* desktop */
  max-width: none;
  background-color: var(--bg3);
  background-image: var(--bg);          /* dot texture */
  background-size: 100px;

  width: 100%;                          /* mobile */
}
```

### Page Structure

Every page in the right panel uses `.page`:

```scss
.page {
  .pageHeading   /* top bar with 3 columns: (M) | (V) | YEAR */
  .pageTitle     /* centered full-width title, uppercase, condensed */
  .content       /* main content area */
}
```

```
┌─────────────────────────────────────────┐
│  (M)             (V)              2026  │  ← .pageHeading
├─────────────────────────────────────────┤
│                                         │
│            SELECTED WORKS               │  ← .pageTitle
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [content]                              │  ← .content
│                                         │
└─────────────────────────────────────────┘
```

---

## 5. BACKGROUND SHADER

> **The shader is the key differentiator of this site.**
> It's not decoration — it's the identity. Cream, orange, indigo flowing organically,
> reacting to mouse movement. Everything is designed around it.

The background is a fullscreen WebGL canvas rendered via the **OGL** library. It is persistent across page transitions (`transition:persist`).

### How it works

```
┌──────────────────────────────────────────────────────────┐
│  1. Canvas covers full viewport (position: absolute,     │
│     z-index: -1)                                         │
│                                                          │
│  2. Flowmap tracks mouse/touch → distorts UV coords      │
│                                                          │
│  3. 3D noise function over time (uTime) generates        │
│     organic flowing lines                                │
│                                                          │
│  4. Two mix() calls blend bg1, bg2, bg3 based on         │
│     noise patterns                                       │
│                                                          │
│  5. Grain overlay: rand(uvRandom) * 0.15                 │
│     → subtle film grain / filigrana                      │
└──────────────────────────────────────────────────────────┘
```

### Shader Uniforms

| Uniform | Type | Source | Description |
|---------|------|--------|-------------|
| `uTime` | `float` | `performance.now() * 0.01` | Animation time |
| `bg1` | `Vec3` | `--bg1` CSS var | Cream color pole |
| `bg2` | `Vec3` | `--bg2` CSS var | Orange color pole |
| `bg3` | `Vec3` | `--bg3` CSS var | Indigo color pole |
| `res` | `Vec4` | window dimensions | Resolution + aspect ratios |
| `tFlow` | `sampler2D` | Flowmap | Mouse velocity texture |

### Color sourcing

The shader reads CSS variables at runtime — **changing CSS vars changes the shader colors** with zero JS changes:

```js
// From bg.js — reads CSS custom properties into shader uniforms
for (const variable of ['--bg1', '--bg2', '--bg3']) {
  let color = getComputedStyle(document.documentElement)
    .getPropertyValue(variable);
  // parses "rgb(r, g, b)" → [r/255, g/255, b/255]
}
```

### Flowmap Settings

```js
const flowmap = new Flowmap(gl, {
  falloff: 0.3,       // How quickly the flow fades from cursor
  dissipation: 0.99,  // How slowly velocity decays (near-persistent)
});

flowmap.velocity.lerp(velocity, 0.15); // Smooth lag on mouse follow
```

### Canvas fixed vs absolute

On mobile, when the left panel content exceeds viewport height, the canvas switches to `position: fixed` to keep it full-bleed:

```js
if (panel.clientHeight > height) {
  canvas.classList.add('fixed');   // position: fixed
} else {
  canvas.classList.remove('fixed'); // position: absolute
}
```

### Dot Texture Overlay

`/public/assets/bg.webp` — a dot grid tile (100px × 100px repeat) sits on top of the shader in `.container` backgrounds:

```css
background-color: var(--bg3);
background-image: var(--bg); /* url('/assets/bg.webp') */
background-size: 100px;
```

---

## 6. COMPONENTS

### Layout.astro

Root wrapper. Loaded for every page.

```
Props: title (string, optional), page (string)

Renders:
  <html lang="en">
    <head>
      SEO meta / OG / Twitter / canonical
      Favicon set
      counter.dev analytics
      ClientRouter (Astro view transitions)
    </head>
    <body transition:animate="none">
      <Bg />       ← WebGL canvas
      <main>
        <LeftPanel {page} />
        <RightPanel {page}>
          <slot />   ← page content goes here
        </RightPanel>
      </main>
    </body>
```

---

### LeftPanel.astro

```
Props: page (string)
Class: "panel left" + "open" when page === "index"

Structure:
  ┌─────────────────────────────────┐
  │  <a href="/">                   │
  │    <h1>Michele Volonghi</h1>    │  ← site name, links home
  │  </a>                           │
  │  <h2 class="subhero">           │  ← hero text (pre-line, uppercase)
  │    [settings.hero]              │    pointer-events: none
  │  </h2>                          │
  │                                 │
  │  <h3 class="subhero right">     │  ← description text (align: flex-end)
  │    [settings.description]       │    supports <i> for italic variant
  │  </h3>                          │
  │                                 │
  │  <div class="menu-wrapper">     │
  │    <Menu />                     │
  │  </div>                         │
  └─────────────────────────────────┘

Click behaviour: clicking the panel background (not links/text)
  → navigates to "/" if not already home
```

---

### RightPanel.astro

```
Props: page (string)
Class: "panel right" + "open" when page !== "index"

Transition: flex-basis 0% → 300% over 0.8s
            translateX(100%) → (0%) over 0.8s

Contains: <div class="container"> wrapping <slot />
```

---

### Menu.astro

Navigation links + Contacts toggle. Populated from `settings.header`.

```
Renders each header item:
  - If item.link → <a href={link}><span>{title}</span></a>
  - If no link   → <span id={item.id}>{title}</span>  (clickable via JS)

Followed by: <Contacts />

Sizes: clamp(2rem, 10vw, 4rem)
Hover: text-shadow 0 0 10px var(--bg3) × 2 (0.4s transition)
```

**Default header config in settings.json:**
```json
[
  { "title": "Projects", "link": "/projects/", "id": "" },
  { "title": "Contacts", "link": "", "id": "contact-button" }
]
```

---

### Contacts.astro

Expandable contact drawer. Toggled by `#contact-button` click.

```
State: .contact-wrapper (collapsed) → .contact-wrapper.open (expanded)

Animation: grid-template-rows 0fr → 1fr   (0.4s)
           opacity 0 → 1                  (1.0s)

Content: settings.contacts rendered as Markdown → HTML
  Paragraph 1: email + phone (stacked flex column)
  Paragraph 2: Github ~ Twitter ~ Insta (inline links)

Link styles: font-size: 1.5rem, text-decoration: underline
```

---

### ProjectPage.astro

Project list rendered in the right panel.

```
Sorted: by date descending

Each project card (.card):
  ┌────────────────────────────────────────────┐
  │  .heading                                  │
  │    .tags   [tags string]                   │  ← 0.6–0.8rem, uppercase, 80% opacity
  │    <span>  [title]         [year]  </span> │  ← 1.8–2.5rem, wdth 92, wght 600
  ├────────────────────────────────────────────┤
  │  <img src={image} alt={title} />           │  ← full width, 1920×1080 natural
  └────────────────────────────────────────────┘

Link: <a href={url} target="_blank"> (all projects open externally)
```

---

### Bg.astro

Thin wrapper. Just the `<canvas>` and a `<script>` tag.

```astro
<script src="@/scripts/bg.js"></script>
<canvas transition:persist class="webgl"></canvas>
```

`transition:persist` — canvas survives page transitions. The shader keeps running, the flowmap state is preserved.

---

## 7. ANIMATIONS & TRANSITIONS

### Page Transitions

Powered by Astro `ClientRouter` (View Transitions API polyfill).

```
transition:animate="none" on <body>
  → Disables the default cross-fade. Panels handle their own transitions.

transition:persist on:
  → <canvas>      (shader keeps running)
  → .panel.left   (left panel doesn't re-mount)
```

### Panel Open/Close Sequence

```
Navigating from / → /projects :

  1. astro:before-preparation fires
     → document.documentElement.classList.add('transition')
     → scrollTo(0, 0, smooth)
     → toggles .panel.right.open prematurely in new doc

  2. CSS transitions animate simultaneously:
     .panel.right: flex-basis 0% → 300% (0.8s ease)
                   translateX(100%) → 0% (0.8s ease)

  3. astro:page-load fires
     → toggles class back (reverse for home direction)

Mobile: on → home, left panel toggles open + 800ms wait before load
```

### Timing Reference

| Transition | Duration | Property |
|-----------|---------|---------|
| Panel open/close | `0.8s` | `flex-basis`, `transform` |
| Left panel min-height | `0.8s` | `min-height` |
| Contact drawer | `0.4s` / `1.0s` | `grid-template-rows` / `opacity` |
| Nav hover glow | `0.4s` | `text-shadow` |

### CSS Grid Reveal Trick (Contacts)

Zero-height → natural height without knowing the content height:

```css
.contact-wrapper {
  display: grid;
  grid-template-rows: 0fr;        /* collapsed */
  transition: grid-template-rows 0.4s, opacity 1s;
  opacity: 0;
}
.contact-wrapper.open {
  grid-template-rows: 1fr;        /* expanded */
  opacity: 1;
}
.inner {
  overflow: hidden;               /* required for the 0fr trick */
}
```

### Duplicate Navigation Guard

```js
// Prevents re-navigating to same page or navigating during transition
el.onclick = (e) => {
  if (href === current || classList.contains('transition')) {
    e.preventDefault();
  }
}
```

---

## 8. CONTENT SYSTEM

### Markdown Renderer (marked.ts)

Custom `marked` renderer wraps the Markdown → HTML pipeline. Used for:
- `settings.description` and `settings.hero` (set via `set:html`)
- `settings.contacts` (rendered in Contacts.astro)
- Project page body content

#### Custom rules

| Input | Output |
|-------|--------|
| Paragraph with single link | Inline `<a>` with `class='single'` (no `<p>` wrapper) |
| Paragraph with single image | Inline `<img>` (no `<p>` wrapper) |
| Heading | `<div class="paragraph"><hN>...</hN>` (wraps section) |
| External link | Adds `target="_blank"` |
| Image | `<div class="img"><img src class="[title]">` |
| `<div class="description">` block | Suppresses `class='single'` on links inside |

#### Image size classes (via image alt title)

```markdown
![Alt text](image.jpg "square")   → .img img.square   (aspect-ratio: 1)
![Alt text](image.jpg "half")     → .img img.half      (width: 50%)
![Alt text](image.jpg "bar")      → .img img.bar       (height: clamp 15–40rem)
```

#### Two-column text

```html
<div class="double">
  Text paragraph here...
</div>
```

#### Description block (disables single-link class)

```html
<div class="description">
  [Michele Volonghi](https://micvolo.com) — normal link, no 'single' class
</div>
```

---

## 9. DATA MODEL & CMS

### Content Collections

Defined in `src/content.config.ts` using Astro Content Collections v2 (loader API).

```
src/data/
  settings/
    settings.json     ← single settings document
  projects/
    *.md              ← one file per project
```

### Settings Schema

```json
{
  "title":            "Michele Volonghi",
  "shortDescription": "string — used in <meta description> and OG",
  "image":            "/assets/og.png — OG image path",
  "hero":             "multiline string — left panel top text (pre-line)",
  "description":      "HTML string — left panel bottom text (supports <i>)",
  "contacts":         "Markdown — rendered in Contacts drawer",
  "header": [
    {
      "title": "string — nav label",
      "link":  "string — href (empty = clickable span)",
      "id":    "string — element id for JS targeting"
    }
  ]
}
```

### Project Schema (frontmatter)

```yaml
---
title:  string       # Display name
date:   YYYY-MM-DD   # Used for sort order
image:  /assets/...  # Preview image path
url:    https://...  # External project URL (opens _blank)
tags:   string       # Category label (e.g. "Ecommerce", "Studio Website")
---

[optional markdown body — rendered via marked.ts custom renderer]
```

### CMS — Sveltia CMS

```
Admin panel:   /admin/
Config:        /public/admin/cms.yml
```

Dev command:
```json
"dev": "astro dev --host"
```

---

## 10. SEO & META

All meta is in `src/layouts/Layout.astro` and sourced from the settings collection.

### Head Tags

```html
<title>{settings.title}{title ? " — " + title : ""}</title>
<meta name="description"   content={shortDescription} />
<meta name="author"        content={settings.title} />
<meta name="robots"        content="index, follow" />
<link rel="canonical"      href={Astro.url} />

<!-- Open Graph -->
<meta property="og:title"       content="{title}" />
<meta property="og:description" content="{shortDescription}" />
<meta property="og:image"       content="{Astro.site}{settings.image}" />
<meta property="og:url"         content="{Astro.url}" />
<meta property="og:type"        content="website" />
<meta property="og:locale"      content="en_US" />

<!-- Twitter / X -->
<meta name="twitter:card"        content="summary_large_image" />
<meta name="twitter:title"       content="{title}" />
<meta name="twitter:description" content="{shortDescription}" />

<!-- Favicons -->
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

### OG Image

- **Source:** `public/assets/og.svg` (editable design)
- **Output:** `public/assets/og.png` (1200 × 630, generated via sharp)

### Analytics

`counter.dev` — privacy-friendly, no cookies, no GDPR issues.

```html
<script
  src="https://cdn.counter.dev/script.js"
  data-id="1cf8f616-153a-4ef0-938e-73df9fb0ac7b"
  data-utcoffset="1">
</script>
```

---

## 11. ADDING NEW SECTIONS

### New Page

1. Create `src/pages/my-page.astro`
2. Use `<Layout title="My Page" page="my-page">`
3. Add a nav link to `settings.json` → `header` array
4. The right panel opens automatically (any `page` value ≠ `"index"`)

```astro
---
import Layout from "@/layouts/Layout.astro";
---
<Layout title="About" page="about">
  <div class="page">
    <div class="pageHeading">
      <div>(M)</div>
      <div>(V)</div>
      <div>{new Date().getFullYear()}</div>
    </div>
    <div class="pageTitle">ABOUT</div>
    <div class="content">
      <!-- your content -->
    </div>
  </div>
</Layout>
```

### New Project

Create `src/data/projects/my-project.md`:

```markdown
---
title: My Project
date: 2026-01-01
image: /assets/projects/myproject.webp
url: https://myproject.com
tags: Ecommerce
---

Optional markdown body content here.
```

Drop the image in `public/assets/projects/`.
The project list sorts by date descending — no config needed.

### Changing the Shader Colors

Just update the CSS variables in `src/styles/global.scss`.
The shader reads them at runtime via `getComputedStyle`. No JS changes needed.

```scss
:root {
  --bg1: rgb(255, 255, 229);  /* ← change this */
  --bg2: rgb(255, 113, 66);   /* ← and this */
  --bg3: rgb(61,  66,  148);  /* ← and this */
}
```

### Changing Typography

To try a different variable font axis preset:

```scss
/* In global.scss or scoped component style */
font-variation-settings: "wdth" 75, "wght" 800, "opsz" 20;
```

Refer to the [Type Scale](#type-scale) table for existing presets.

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MICVOLO DESIGN SYSTEM — v1.0 — 2026
  Michele Volonghi · micvolo.com · michele@stra.studio
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

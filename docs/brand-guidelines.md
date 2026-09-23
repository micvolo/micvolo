# Linee guida di brand

Queste regole descrivono l’identità digitale di Michele Volonghi. Sono il riferimento per l’evoluzione di micvolo.com e la base da adattare — senza clonare automaticamente il layout — negli altri siti del brand.

*Versione attuale: 2025-09. Autore: Michele Volonghi. Questo documento sostituisce ogni versione precedente e rimanda ai file/token che ne attuano le regole.*

## Principi

- **Diretto e competente.** Il design deve sembrare il lavoro di una persona esperta, non di un’agenzia impersonale.
- **Tecnico ma accessibile.** Precisione, gerarchie chiare e dettagli curati; mai complessità esibita senza una funzione.
- **Calmo, non statico.** Le interazioni confermano un’azione o uno stato, senza cercare attenzione.
- **Contenuto prima dell’effetto.** Progetti, servizi e contatti restano sempre leggibili e immediati.
- **Liste come righe, non come card.** Un elenco ben impaginato (vedi pattern Lab) fa più lavoro di una griglia di card: numeri, titoli e descrizioni vivono in una colonna stretta separata da una sola lineetta. Niente card dentro card, niente hover che solleva, niente badge decorativi.

## Voce

Usare frasi brevi, concrete e in forma attiva. Preferire parole comuni a formule promozionali. Evitare superlativi, slogan generici e gergo da agenzia. Etichette e call to action devono dire esattamente cosa succede: “Book a call”, “Copy”, “Open project”.

## Sistema visivo

### Colore

La base dell’interfaccia e lo shader seguono automaticamente la preferenza chiara o scura del sistema. Il toggle parte disattivato e alterna solo le palette **greyscale** e **accent** dello shader, con una transizione morbida: entrambe hanno una variante chiara e una scura. La scelta resta attiva durante la navigazione e nell’area riservata.

| Ruolo | Chiaro | Scuro |
| --- | --- | --- |
| Fondo UI | `#f7f7f5` | `#1e1e1e` |
| Testo | `#1a1a19` | `#f0f0ee` |
| Testo secondario | `#4a4a47` | `#b8b8b5` |
| Accento | `#b8552e` | `#d9784f` |

La palette accent dello shader riprende esattamente l’identità originale: crema `#ffffe5`, arancio `#ff7142` e blu `#3d4294`. La variante scura conserva arancio e blu originali su una base notte. La palette predefinita usa esclusivamente grigi caldi. Nell’interfaccia, usare il terracotta per link, focus, stati attivi e piccoli punti di enfasi. Non introdurre altri colori saturi senza una ragione semantica. Le superfici possono essere traslucide, ma testo e controlli devono mantenere un contrasto netto.

### Tipografia

- Famiglia principale: **SF Pro Text** self-hosted in quattro pesi WOFF2; `sf-pro.ttf` è la stessa famiglia usata dai canvas tipografici. I fallback sono esclusivamente font di sistema. Implementazione: `--font: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; --font-display: var(--font);`.
- Titoli: peso `600–650`, spaziatura leggermente stretta, dimensioni contenute.
- Testo: peso regolare, interlinea generosa, righe brevi.
- Label e metadati: piccole, semibold e maiuscole solo quando aiutano davvero la scansione.
- Numeri e dati: cifre tabulari.

La gerarchia nasce soprattutto da peso, colore e spazio; non da salti di scala teatrali.

### Forma e spazio

Usare una griglia basata su multipli di `4px`, con `8 / 12 / 16 / 24 / 32 / 48 / 64px` come scala principale. Le superfici hanno angoli morbidi (`8px` per elementi interni, `16px` per pannelli) e i controlli compatti possono essere pillole. Bordi sottili e ombre diffuse separano i livelli senza creare card pesanti. Eccezione: gli stage delle esperienze native (Lab, Letter Flow) sono **blocchi a angoli vivi**, senza cornice né raggio.

Le immagini dei progetti mantengono sempre il proprio rapporto d’aspetto, senza crop o filtri decorativi. Su desktop i progetti scorrono in due colonne editoriali indipendenti, con altezze naturali; su mobile tornano in una sola colonna.

## Shell e navigazione

Il sito usa un layout persistente a due colonne su desktop (`≥901px`): la rail sinistra è sticky e scrollabile, il contenuto principale scorre a destra. Su mobile la rail si dispone in colonna sopra il contenuto tramite `display: contents` e un ordine esplicito (`site.css`).

La rail è divisa in gruppi di categoria:

1. **Work** — Projects (indice di tutti i progetti).
2. **Experiments** — Lab (archivio degli esperimenti), Letter Flow.
3. **Games** — Chameleon, Teamword.
4. **Main** — Client access, Palette toggle.

Ogni voce integrata è una `.rail-app-card`: segnaposto neutro a sinistra (`.rail-app-card__placeholder`, fondo `var(--fill-2)`, nessun logo), titolo e breve descrizione a destra, freccia. Lab, Chameleon e Teamword non usano icone. Gli stati attivi usano `aria-current="page"` e un fondo/bordo accentuato. La rail persiste attraverso la navigazione via `transition:persist="site-rail"`; lo scroll e lo stato attivo vengono ripristinati su ogni cambio di rotta interna.

## Route map

| Route | Tipo | Scopo |
| --- | --- | --- |
| `/` | Prerendered | Home con shader ambientale |
| `/projects` | Prerendered | Griglia di tutti i progetti |
| `/projects/letter-flow` | Prerendered | Esperienza nativa Letter Flow |
| `/lab` | Prerendered | Indice degli esperimenti |
| `/lab/[slug]` | Prerendered | Dettaglio di un esperimento |
| `/games` | Prerendered | Indice dei giochi |
| `/games/chameleon` e sotto-route | Prerendered | Gioco Chameleon |
| `/games/teamword` | Prerendered | Gioco Teamword |
| `/portal/*`, `/admin/*`, `/api/*`, `/documents/*` | On-demand | Area riservata e API |

## Liste ed elenchi (no AI slop)

- Niente `eyebrow`, niente meta `medium · anno`, niente badge numerati decorativi nei testi.
- Le liste (Lab, progetti, voci) sono righe semplici: **numero, nome, descrizione**.
- Una sola riga divisoria sottile (`var(--glass-edge)`), nessuna altezza fissa, nessuna card dentro card.
- Il dettaglio Lab ha header su una riga: titolo + descrizione a sinistra, due frecce minimal (avanti/indietro, sole icone) a destra. Niente link Index, niente Random.

## Pattern Lab — righe, dettaglio e contenimento

Il Lab è il **pattern canonico** per qualsiasi elenco o dettaglio del sito. Usalo come riferimento ogni volta che devi elencare cose (esperimenti, giochi, documenti, anni, voci di archivio) o mostrare un singolo elemento con stage. Tre ricette distinte, tutte coerenti fra loro.

### Indice: lista di righe

La pagina `/lab` mostra l’intero archivio come elenco, non come griglia. È il layout predefinito per qualunque cosa sia “molte cose, una riga ciascuna”.

```
┌──────────────────────────────────────────────────────────┐
│ 01   Pulse poem                                           │
│      A short text that responds like a living pulse.    │
├──────────────────────────────────────────────────────────┤
│ 02   Type field                                           │
│      A field of letters shaped by noise and motion.     │
└──────────────────────────────────────────────────────────┘
```

- **Struttura**: `<ol class="lab-list">` di `<li>` con una sola `<a class="lab-row">` per voce. Nessun wrapper card, nessun `figure`, nessun `padding-block` pesante.
- **Griglia interna**: due colonne — `grid-template-columns: 3rem minmax(0, 1fr)` con `gap: var(--s3)`. La prima colonna è il numero, la seconda è titolo + descrizione.
- **Separatore**: solo `border-top: 1px solid var(--glass-edge)` fra un `<li>` e il successivo. Mai `border-bottom` su tutti (evita il doppio bordo al primo/ultimo).
- **Numerazione**: contatore in `color: var(--ink-3)` con `font-variant-numeric: tabular-nums`. Padding a due cifre (`String(index + 1).padStart(2, '0')`) — la cifra zero è una scelta tipografica, non un vezzo.
- **Testo della riga**:
  - titolo: `font-weight: 500`, dimensione corpo, nessun `font-size` gonfiato.
  - descrizione: `color: var(--ink-2)`, `line-height: 1.45`, `font-size` corpo (mai `--f-small`).
- **Hover**: cambia solo `color` del titolo a `var(--accent)`. Niente cambio di background, niente cambio di bordo, niente `translateY`, niente scale, niente ombra.
- **Larghezza**: `max-width: 44rem` sull’elenco e sull’header. La lettura resta in colonna stretta; il resto della pagina respira.
- **Meta**: anno e medium **non** compaiono nella riga dell’indice — sono già nel codice e nel dettaglio. Se servono, è solo nel dettaglio, vedi sotto.
- **Token**: `var(--s3)` per il padding verticale delle righe, `var(--s4)` per separare l’header dall’elenco.

### Dettaglio: header su una riga + stage

La pagina `/lab/[slug]` apre un singolo esperimento con la stessa economia dell’indice. Il pattern vale per qualsiasi dettaglio (singolo progetto nativo, singolo documento, singolo gioco quando non ha shell propria).

- **Header**: `display: flex; justify-content: space-between` su una sola riga.
  - A sinistra: `h1` con `font-weight: 500`, `font-size: var(--f-lead)`, e descrizione sotto in `var(--ink-2)` con `max-width: 56ch`.
  - A destra: due `<a>` come icone sole (`StrokeIcon` `arrow-left` / `arrow-right`), `width/height: var(--ctl)`, color `var(--ink-2)`, hover a `var(--accent)` + `var(--fill-2)`.
  - **Mai** link “Index”, “Random”, “Torna su”, breadcrumb, share, like.
- **Bordo sotto l’header**: `border-bottom: 1px solid var(--glass-edge)` — è lo stesso separatore della lista, ma qui chiude la testata invece di aprire una nuova riga. Stessa grammatica, diverso ruolo.
- **Stage**: nessuna card, nessun wrapper con superficie: solo il blocco stage a angoli vivi (`border-radius: 0`, nessun bordo). Lo stage canvas mantiene un `aspect-ratio` (4/3 desktop, 1/1 mobile) e `max-height: 72vh`; il resto della pagina cresce con il contenuto.
- **Meta dello stage** (facoltativa, solo se il medium/anno aiuta davvero): una riga sopra o sotto l’header con `font-size: var(--f-small)`, `color: var(--ink-3)`, peso regolare. Mai badge, mai `medium · anno` come fosse un tag. Esempio: `2024 · WebGL · OGL` in piccolo, separato da un `·` non da una card.

### Pattern complementari (Teamword e simili)

Quando la pagina è un piccolo strumento invece che un elenco, lo stesso principio si applica a campi e controlli:

- **Label sopra il valore**, mai inline a sinistra. `<legend class="section-label">` in `var(--ink-2)`, peso 500, dimensione corpo. Il valore sotto ha il peso/contrasto che merita (numeri grandi in 500, `font-variant-numeric: tabular-nums`).
- **Separatori fra dati, non fra sezioni**: in Teamword le stats (Time / Score) sono una griglia con `border-top` + `border-bottom` su tutta la riga e `border-left` fra le colonne. È lo stesso `var(--glass-edge)` dell’indice Lab, usato per costruire una piccola “tabella senza tabella”.
- **Azioni piatte**: `background: var(--fill-2)`, nessun bordo, nessuna ombra, nessun `translateY` su hover. Hover sale solo a `var(--fill-3)`; press può fare `transform: scale(.975)` solo su azioni primarie di gioco, mai su link di navigazione.
- **Parola protagonista**: l’elemento più importante della pagina è tipografia, peso 500, `letter-spacing` negativo, dimensione generosa. Mai badge, mai cornice, mai “card della parola”.
- **Skip / contatore ornamentale**: invece di un’icona, usa una sequenza di lettere/numero (`···`, `3`) in `color: var(--accent)`, `letter-spacing` ampio, `font-weight: 700`. Tipografia come decorazione, non glifo come decorazione.

### Quando usare il pattern Lab

Usa il pattern Lab come scelta predefinita per:

- indici di archivio (esperimenti, documenti, anni, tag).
- dettagli di un singolo elemento quando la pagina è “una cosa con un suo stage”.
- qualsiasi situazione in cui la tentazione è una griglia di card: prova prima la lista.

Non usarlo per:

- portfolio visivo di lavori con immagini protagoniste (vedi `/projects` e `ProjectGrid.astro`, dove le card sono il contenuto, non il contenitore).
- form, wizard, pagine di amministrazione.

### Implementazione di riferimento

| Pezzo | File |
| --- | --- |
| Indice Lab | `src/pages/lab.astro`, `.lab-list` / `.lab-row` |
| Dettaglio Lab | `src/pages/lab/[slug].astro`, `src/components/lab/LabCard.astro` |
| Dati elenco | `src/lib/lab/projects.ts` |
| Pattern complementare | `src/components/games/teamword/Teamword.astro` (`.teamword__board`, `.word`, `.skip-count`) |

## Esperienze native / finestre contenute

Ogni esperienza (Lab, Letter Flow, giochi) vive dentro la pagina del sito, non a schermo intero:

- **Niente card per Lab e Letter Flow**: solo testo (header/intro) e il blocco stage, con angoli vivi e senza bordo. Nessuna superficie in vetro attorno allo stage.
- Nessuna altezza fissa (`min-height: 70svh`, `calc(100svh - …)`) sui blocchi: l’altezza segue il contenuto; solo lo stage canvas ha un rapporto d’aspetto (`4/3`, `1/1` su mobile).
- Nessuno sfondo di progetto a tutto schermo; lo shader ambientale resta visibile dietro.
- Canvas/WebGL sono inizializzati su `astro:page-load`, guardati contro il doppio avvio e smontati su `astro:before-swap`/`pagehide`.
- `prefers-reduced-motion` disabilita animazioni non essenziali e offre un fallback statico.
- I controlli interattivi seguono le regole di accessibilità del sistema: focus visibile, target ≥ 40px, contrasto AA.

## Interazioni e movimento

- Gli hover possono cambiare **colore, fondo, bordo o ombra**.
- **Mai sollevare elementi verso l’alto al passaggio del mouse o al focus**: niente `translateY`, “lift” o effetti equivalenti.
- **Mai zoomare o scalare le immagini dei progetti**, né su hover né durante l’ingresso in pagina.
- Le frecce possono compiere un piccolo movimento coerente con la loro direzione.
- Le transizioni di stato devono essere brevi (`180–300ms`) e naturali.
- Le transizioni fra pagine restano discrete, preferibilmente una dissolvenza (`fade 0.22s` in `PublicLayout.astro`).
- Animazioni ambientali o informative sono ammesse solo se non ostacolano lettura e navigazione.
- Rispettare sempre `prefers-reduced-motion`, eliminando movimento spaziale e inerzia non necessaria.

## Accessibilità e qualità

- Focus da tastiera sempre visibile con il colore di accento (`:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }`).
- Testo e controlli devono rispettare il contrasto WCAG AA.
- Target interattivi di almeno `40–44px` quando possibile.
- Non affidare mai un’informazione al solo colore o al solo movimento.
- Immagini con dimensioni dichiarate; testo alternativo quando comunicano contenuto.
- Il sito deve restare comprensibile e utilizzabile senza animazioni e senza JavaScript non essenziale.

## Mappa regola → file/token

| Regola | File/Token |
| --- | --- |
| Palette e tokens | `src/styles/site.css` `:root` |
| Shader e transizioni palette | `public/theme.js`, `src/components/AmbientShader.astro` |
| Layout shell e rail | `src/components/public/SiteRail.astro`, `src/styles/site.css` |
| Transizioni pagina | `src/layouts/PublicLayout.astro` |
| Modello contenuti | `src/content.config.ts` |
| Esperienze Lab | `src/lib/lab/projects.ts`, `src/components/lab/*` |
| Letter Flow | `src/components/letter-flow/*`, `src/pages/projects/letter-flow.astro` |
| Giochi | `src/components/games/*`, `src/scripts/chameleon.ts`, `src/scripts/teamword.ts` |

## Pannelli di calibrazione

Tutti i pannelli Tweakpane v4 (esperimenti Lab e Letter Flow) usano un’unica factory condivisa in `src/lib/panel/panel.ts` e un tema minimal in `src/lib/panel/panel.css`. Il tema applica i token di brand (SF Pro, superficie in vetro, bordi sottili, colore accent), posizionamento coerente in alto a destra, righe compatte e stato collapsed di default su schermi ≤720px. Letter Flow usa la variante compatta (max 240px, righe da 32px). Il Reset vive solo dentro il pannello Settings, niente pulsanti Reset sparsi né scorciatoie da tastiera. Non si aggiungono stili per-pannello né variabili `--tp-*` sparse.

## CSS scoped per componente

Gli stili globali in `src/styles/site.css` limitati a: design system/tokens, reset di base, utilità, shell di navigazione, area riservata/admin. Gli stili specifici di esperienze (Lab, giochi, Letter Flow) e componenti della rail/progetti vivono in blocchi `<style>` dei propri componenti Astro; dove il markup è generato lato client (canvas p5/WebGL, DOM dei giochi) si usa `<style is:global>` anziché lasciare regole globali in `site.css`.

## Checklist per nuove pagine o siti

1. La pagina ha un compito principale evidente?
2. Usa la stessa voce diretta e concreta?
3. Colori, tipo e spazi derivano dal sistema, invece di aggiungere stili arbitrari?
4. Gli stati interattivi restano fermi sul piano, senza lift verticale?
5. Le immagini restano ferme, senza zoom?
6. Focus, contrasto, mobile e riduzione del movimento sono verificati?
7. Ogni effetto rimasto aiuta davvero orientamento o feedback?
8. La nuova rotta è raggiungibile dalla rail o dalla sua categoria?
9. Script client-side si inizializzano su `astro:page-load` e si puliscono su `astro:before-swap`?
10. Se è un elenco o un dettaglio: ho applicato il pattern Lab (righe numerate, una lineetta, hover solo colore, niente card dentro card)?

## Project pages & imagery rules

Standing rules for single project pages, case studies and image layouts

1. No card frames or rounded boxes on project pages — text sits directly on the background, images are flush with no borders, masks or radius
2. Everything left-aligned in the content column — widths may alternate (full, half, quarter) but every block starts at the left edge
2bis. Never place text beside images — neither to the right nor to the left; text sits only ABOVE or BELOW the image blocks
3. Never use long/tall portrait images — they read badly; place portrait shots side by side in pairs with padding instead
3bis. Landscape images are ONLY full width or exactly half width — never smaller than half, never quarter, never thumbnails; the side-by-side grid is 2-up (pairs of half width), never 3-up
3ter. Approved image compositions per block: 4 mobile shots together, 2 landscape, 2 mobile, or 1 landscape plus text
4. Side-by-side images share the same height, with a consistent gap from the --s* spacing tokens
5. While an image loads, show a simple liquid animated placeholder matching the image aspect ratio (no layout shift, no radius)
6. Project icons are iOS-style squircles — uniform inset, subtle sheen and depth; when a site has no favicon use the standard rail placeholder, never invent monograms or logos
7. External project link button after the first note: pill, --ctl height, --fill-2 to --fill-3 hover, sentence case, pragmatic label
8. Case-note copy: pragmatic technical developer voice, deliberately specific, no final periods, no marketing fluff; tasteful dash lists are allowed where they read better than prose
9. No "Return to homepage" links in project-page CONTENT — the mobile sticky navigation card with "Return to homepage" is navigation chrome and is the one allowed exception
10. Project dates display as a bare YEAR (2024) or "Current" when the project is ongoing — never months or date ranges
11. Never nest cards — one card per container; inside it use light elegant hairline grid separators instead of inner cards, and the separators must adapt cleanly to the device theme in dark and light mode
12. Minimize layout shift (CLS): reserve space for media and blocks, keep UI blocks in fixed stable positions (e.g. game grids always at the same top spot), and reveal animations must never move the layout
13. Grids read as plain ruled grids — thin delicate hairlines with standard --s* spacing, no decorative card panels behind them

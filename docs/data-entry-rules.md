# Data entry rules (AI writer)

Standing rules for the AI assistant when the user asks to log work, quote work, or change project data. The admin forms are gone — **the AI is the only writer**. Never create payment, billing or invoice data: hours and estimates only.

## Where data lives

| File | Role |
| --- | --- |
| `src/lib/admin-data/data.ts` | the store ("the database"): three row arrays — `projects`, `estimates`, `timeEntries` |
| `src/lib/admin-data/index.ts` | schema (`AdminProject`, `EstimateDoc`, `TimeEntry`) + `getProjects()` read facade + `DEFAULT_RATE_EUR` |
| `public/preventivi/<slug>/<estimate-id>.pdf` | one preventivo PDF per estimate row |
| `src/lib/admin-data/pdf.mjs` | regenerates the preventivi PDFs |
| `src/lib/admin-data/check.mjs` | validates all invariants, exits non-zero on problems |

This is a build-time TS store: the sync `getProjects(): AdminProject[]` contract cannot read D1, and a later D1 migration can keep the same facade. `migrations/` and `seeds/demo.sql` belong to the portal D1 demo data — do not touch them for this dataset.

## Schema (rows in `data.ts`)

```ts
// projects — one per client project, newest first by the date in src/data/projects/<slug>.md
{ slug: 'abitare-in-legno', title: 'Abitare in Legno', description: 'Sito immobiliare X-Lam — ...', rate: 40 } // rate optional, default 40

// estimates — one base preventivo per project, plus 1-2 extensions when needed
{ id: 'est_abitare-in-legno_02', slug: 'abitare-in-legno', date: '2026-04-20', hours: 10, amount: 400, note: 'il cliente aggiunge la fase di nuovi appartamenti — stimo 10 ore a 400 euro', pdfUrl: '/preventivi/abitare-in-legno/est_abitare-in-legno_02.pdf' }

// timeEntries — logged work sessions
{ id: 'log_abitare-in-legno_12', slug: 'abitare-in-legno', date: '2026-09-08', hours: 5, note: 'passata performance sulle gallerie e budget immagini' }
```

IDs are `est_<slug>_<NN>` / `log_<slug>_<NN>`, zero-padded in chronological order. `date` is ISO `YYYY-MM-DD`. The UI renders an entry as `24 settembre 2025 · 2 ore · cosa fatta` and derives `estimatedHours = sum(estimates.hours)`, `workedHours = sum(entries.hours)`, monthly earnings = monthly hours × the project's own `rate`.

## Recipes

### Add a work entry (the "4 ottobre, 3 ore, fix del carrello" request)

Append a row in the project's block of `timeEntries`, in date order, then run the checker:

```ts
{ id: 'log_abitare-in-legno_13', slug: 'abitare-in-legno', date: '2026-09-22', hours: 3, note: 'pulizia finale delle schede appartamento' },
```

```sh
node src/lib/admin-data/check.mjs
```

### Add an estimate extension ("servono altre 20 ore")

Real workflow: the worked hours approach or cross the total estimate (e.g. 40/40), the client asks for more, and the quote is "ok stimo 20 ore a 800 euro" — the total becomes 60. Add the estimate row **and** its PDF:

```ts
// 1. row in estimates (amount = hours × project rate, keep the project's rate)
{ id: 'est_abitare-in-legno_04', slug: 'abitare-in-legno', date: '2026-10-05', hours: 20, amount: 800, note: 'il cliente chiede le pagine cantieri — stimo 20 ore a 800 euro', pdfUrl: '/preventivi/abitare-in-legno/est_abitare-in-legno_04.pdf' },
```

```sh
node src/lib/admin-data/pdf.mjs --all    # writes public/preventivi/<slug>/<id>.pdf
node src/lib/admin-data/check.mjs
```

A single PDF can also be written by hand: `node src/lib/admin-data/pdf.mjs /preventivi/<slug>/<id>.pdf "Proroga preventivo" "Progetto" "5 ottobre 2026" "stimo 20 ore a 800 euro" "" "20 ore × 40 EUR/h" "Totale 800 EUR"`.

### Create a project

Add a `projects` row (slug = the `src/data/projects/<slug>.md` slug), one base estimate row dated before the first entry, and its PDF (`pdf.mjs --all`), then log entries as they happen. Base estimates are sized to the project: small site 20-30h, medium 40-80h, big or ongoing 100-160h.

```ts
{ slug: 'nuovo-cliente', title: 'Nuovo Cliente', description: 'Sito istituzionale — pagine e CMS', rate: 40 },
{ id: 'est_nuovo-cliente_01', slug: 'nuovo-cliente', date: '2026-10-01', hours: 40, amount: 1600, note: 'stimo 40 ore a 1600 euro per il sito', pdfUrl: '/preventivi/nuovo-cliente/est_nuovo-cliente_01.pdf' },
```

### Set or change the project rate

Edit `rate` on the `projects` row (omit it for the default 40). Historical projects carry historical rates (20-30 EUR/h), recent ones 40. Existing `amount` values are snapshots of the quote at the time: **never recompute them**. New estimates use the current rate, extensions keep the project's rate.

## Invariants (`check.mjs` enforces most)

- `amount = hours × project rate`, EUR; rate in EUR/h, default 40
- ISO dates; the base estimate predates the first entry; rows stay ascending by date within each project block
- entry `hours`: integers 1-8 per session; project totals realistically 25-120h (ongoing ones more); `workedHours` should read meaningfully against the estimates (e.g. 12/40) — add an extension when it approaches or crosses them
- entry notes: Italian log voice, lowercase, one short concrete task line (what was done), **no final period**, direct and concrete like `docs/brand-guidelines.md` — no marketing tone
- estimate notes: first person `"stimo N ore a M euro"`, lowercase, no final period; an extension may add a short reason before the dash
- one PDF per estimate at `public/preventivi/<slug>/<id>.pdf`
- never: payments, invoices, billing data, or hour edits that change what was billed

## Apply and verify in dev

Data is build-time: there is nothing to apply — `npm run dev` hot-reloads and `npm run build` bakes the rows in. After any edit run `node src/lib/admin-data/check.mjs`; after any estimate edit run `node src/lib/admin-data/pdf.mjs --all` first.

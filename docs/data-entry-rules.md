# Data entry rules (AI writer) — everything is in the DB

Standing rules for the AI assistant when the user asks to log work, quote work, change a rate, or attach a file. The admin data lives in D1 — there is no TS store any more and no admin forms: **the AI is the only writer**, through SQL or the authenticated CRUD API. Never create payment, billing or invoice data: hours and estimates only.

## Where data lives

| Thing | Role |
| --- | --- |
| `tracking_projects` (D1) | one row per client project: `slug, title, description, rate, sort_order` |
| `estimate_docs` (D1) | preventivi: `id, slug, date, hours, amount, note, pdf_url` |
| `time_entries` (D1) | work log: `id, slug, date, hours, note` |
| `tracking_documents` (D1) | "documenti" attachments: `id, slug, name, r2_key, created_at` — **may be empty**, zero per project is completely valid |
| `public/preventivi/<slug>/<file>.pdf` | the preventivo PDFs, uploaded by the user |
| DOCUMENTS (R2) | the "documenti" files, served through `/documents/<key>` |
| `migrations/`, `seeds/` | schema + the 20/26/161 seed rows |

Derived numbers are never stored: `estimatedHours` = Σ estimate `hours`, `workedHours` = Σ entry `hours`, monthly earnings = monthly hours × the project's own `rate`.

## Cookbook (one shot each)

AUTH for every curl: the same admin session as `/admin` — send the session cookie with `-b` (dev name `micvolo_session`, production `__Host-micvolo_session`, get it from the admin login flow). Run against `http://localhost:4321` in dev. SQL goes through `wrangler d1 execute micvolo --local --command "…"`.

### Aggiungi una giornata di lavoro ("4 ottobre, 3 ore, fix del carrello")

```sh
curl -s -X POST http://localhost:4321/api/admin/entries -H 'Content-Type: application/json' -b "micvolo_session=$TOKEN" \
  -d '{"slug":"abitare-in-legno","date":"2026-09-22","hours":3,"note":"pulizia finale delle schede appartamento"}'
```

```sql
INSERT INTO time_entries (id, slug, date, hours, note)
VALUES ('log_abitare-in-legno_13', 'abitare-in-legno', '2026-09-22', 3, 'pulizia finale delle schede appartamento');
```

`hours` is an integer 1-8 per session; the API mints the `log_<slug>_<NN>` id if you omit it.

### Aggiungi una proroga ("servono altre 20 ore")

**I PDF li carica l'utente.** The AI never generates or edits a PDF — it only writes the `estimate_docs` row whose `pdfUrl` points at `public/preventivi/<slug>/<file>.pdf` (the files already there are placeholders until the user replaces them). So: the user drops the proroga PDF in `public/preventivi/<slug>/`, then the AI writes the row:

```sh
curl -s -X POST http://localhost:4321/api/admin/estimates -H 'Content-Type: application/json' -b "micvolo_session=$TOKEN" \
  -d '{"slug":"abitare-in-legno","date":"2026-10-05","hours":20,"note":"il cliente chiede le pagine cantieri — stimo 20 ore a 800 euro","pdfUrl":"/preventivi/abitare-in-legno/est_abitare-in-legno_04.pdf"}'
```

```sql
INSERT INTO estimate_docs (id, slug, date, hours, amount, note, pdf_url)
VALUES ('est_abitare-in-legno_04', 'abitare-in-legno', '2026-10-05', 20, 800, 'il cliente chiede le pagine cantieri — stimo 20 ore a 800 euro', '/preventivi/abitare-in-legno/est_abitare-in-legno_04.pdf');
```

`amount` is derived (`hours × rate`, 800 = 20 × 40): omit it in curl and the API fills it, or pass it and the API checks it.

### Carica un documento ("documenti")

```sh
curl -s -X POST http://localhost:4321/api/admin/documenti -b "micvolo_session=$TOKEN" -F slug=bloem -F name=contratto.pdf -F file=@contratto.pdf
```

PDF only (≤ 10 MB). Base64 JSON works too: `-H 'Content-Type: application/json' -d '{"slug":"bloem","name":"contratto.pdf","data":"<base64>"}'`. The file lands in the DOCUMENTS R2 bucket and shows up as an open/download link under **Documenti** on the project page. Zero documents on a project is a valid state — leave it alone. To remove one: `curl -s -X DELETE -b "micvolo_session=$TOKEN" "http://localhost:4321/api/admin/documenti?id=doc_bloem_01"`.

### Cambia tariffa

```sh
curl -s -X PUT http://localhost:4321/api/admin/tracking-projects -H 'Content-Type: application/json' -b "micvolo_session=$TOKEN" -d '{"slug":"bloem","rate":25}'
```

```sql
UPDATE tracking_projects SET rate = 25 WHERE slug = 'bloem';
```

Existing `amount` values are snapshots of their quote — **never recompute them**. New estimates use the current rate.

### Aggiungi un progetto

```sh
curl -s -X POST http://localhost:4321/api/admin/tracking-projects -H 'Content-Type: application/json' -b "micvolo_session=$TOKEN" \
  -d '{"slug":"nuovo-cliente","title":"Nuovo Cliente","description":"Sito istituzionale — pagine e CMS","rate":40}'
```

Then one base preventivo row (see recipe above) dated before the first entry — sized to the project: small site 20-30h, medium 40-80h, big or ongoing 100-160h — and work entries as they happen. `slug` is the `src/data/projects/<slug>.json` slug.

## CRUD API at a glance

Same four verbs on `/api/admin/entries`, `/api/admin/estimates`, `/api/admin/tracking-projects`, `/api/admin/documenti`. JSON in/out, admin session only (role `admin`, resolved by the existing session middleware). Bodies mirror the row shapes (`pdfUrl` ↔ `pdf_url`):

| Call | Body / params |
| --- | --- |
| `POST /api/admin/entries` | `{slug, date, hours, note}` (optional `id`) |
| `PUT /api/admin/entries` | `{id, date?, hours?, note?}` |
| `DELETE /api/admin/entries?id=log_<slug>_01` | |
| `POST /api/admin/estimates` | `{slug, date, hours, note, pdfUrl}` (optional `id`, `amount`) |
| `PUT /api/admin/estimates` | `{id, date?, hours?, note?, pdfUrl?}` |
| `DELETE /api/admin/estimates?id=est_<slug>_01` | |
| `GET/POST /api/admin/tracking-projects` | `{slug, title, description?, rate?}` |
| `PUT /api/admin/tracking-projects` | `{slug, title?, description?, rate?}` |
| `DELETE /api/admin/tracking-projects?slug=<slug>` | cascades its rows, removes its R2 files |
| `GET/POST/DELETE /api/admin/documenti` | upload body above, `?id=` for delete |

`GET` on any of them (optional `?slug=`) returns the rows as JSON — use it to verify an edit. The pages stay read-only display.

## Invariants

- `amount = hours × rate` (EUR; rate is EUR/h, default 40) for every estimate written; historical amounts stay frozen snapshots
- dates are ISO `YYYY-MM-DD`, the base preventivo predates the first entry, entry `hours` are integers 1-8
- note voice: entry notes are lowercase Italian log lines — one short concrete task, **no final period** (`passata performance sulle gallerie e budget immagini`); estimate notes are first person `"stimo N ore a M euro"`, lowercase, no final period, a short reason may come before the dash

The API and the SQLite CHECKs enforce these — there is no separate checker script. Quick sanity pass any time:

```sh
wrangler d1 execute micvolo --local --command "SELECT slug, (SELECT SUM(hours) FROM time_entries t WHERE t.slug = p.slug) AS worked, (SELECT SUM(hours) FROM estimate_docs e WHERE e.slug = p.slug) AS estimated FROM tracking_projects p ORDER BY sort_order"
```

## Apply migrations and seeds locally

```sh
wrangler d1 execute micvolo --local --file=./migrations/0001_foundation.sql
wrangler d1 execute micvolo --local --file=./migrations/0002_admin_tracking.sql
wrangler d1 execute micvolo --local --file=./seeds/admin-tracking.sql
```

`seeds/` is **local development only** (20 projects · 26 estimates · 161 entries; `seeds/demo.sql` is the portal demo) — never apply seeds to production. Migrations to production use `--remote`. After schema/seed changes, `npm run dev` picks the data up on the next request — no build step involved.

## Graphic experiments (lab projects)

Unchanged content-collection world, one JSON file per experiment: `src/data/lab-projects/<key>.json` (key = route). Five required string fields: `title`, `year`, `medium`, `description`, `hue` (`rose | gold | lime | blue | violet | cyan`). No `id` in the data — it derives from the filename. Adding an experiment also needs a mount entry in `src/components/lab/experiments/index.ts`.

## Project pages (case studies) — composition recipe

One JSON per case at `src/data/projects/<slug>.json`, images co-located at `src/data/projects/<slug>/`: `cover.webp` plus `screen-*.webp` (convention: `screen-desktop-NN.webp` / `screen-mobile-NN.webp`). The slug is the filename and never appears in the data. Schema: `src/content.config.ts`. After any edit run `node scripts/validate-projects.mjs` — it checks shape, filename↔slug consistency and that every file in the folder is referenced.

A case reads top to bottom as alternating notes and screenshot blocks:

1. The header composes itself from the data: iOS-style app icon (or the rail placeholder), `title`, and `date` as a bare year or `Current` — nothing to write there.
2. `notes[0]` is the opening note; the optional `url` renders the "Visit site" pill button right after the first note.
3. Then every screen slot is preceded by its note: `screens[i]` renders under `notes[i]`. Extra trailing notes (`notes` past `screens.length`) close the page. `notes.length >= screens.length` is mandatory — every screen slot needs a note above it.
4. A note is a plain string, or `{ lead, items: string[] }` for a lead line plus a dash list (case-note voice: rules in `docs/brand-guidelines.md`, no final periods).

Three slot shapes (image proportions per block follow the imagery rules in `docs/brand-guidelines.md`):

| Slot | Shape |
| --- | --- |
| single landscape | `{ file, width: full\|half, alt }` — never below half width |
| row | `{ layout: grid\|pair\|quad, width: full\|half\|quarter, row: [{ file, alt }, …] }` — `grid` = 2 landscapes, `pair` = 2 portraits, `quad` = 4 portraits |
| split | `{ layout: "split", width, file, alt, aside }` — one landscape with its note beside it (below when narrow); `aside` is a note |

Approved block compositions: 4 mobile shots together, 2 landscape, 2 mobile, or 1 landscape plus text. Top-level fields: `title`, `date`, `tags`, `url` (optional), `description`, `summary`, `cover`, `notes`, `screens` — nothing else.

# micvolo.com

A minimal Astro portfolio and private collaboration ledger running on Cloudflare Workers.

## Product surface

- Static public portfolio with the existing copy and 25 project records.
- Passwordless client portal scoped to one project per client.
- Separate, allowlisted admin backoffice for projects, work logs, timeline updates, invoices, payments and PDFs.
- D1 for relational data, private R2 for documents, and Cloudflare Email Service for one-time access codes.

The UI follows the visitor's light or dark system setting. Public pages are prerendered; only authentication, portal, admin, API and document routes execute on the Worker.

## Local development

Requirements: Node.js 22+ and a Cloudflare login for remote operations.

```bash
npm install
cp .dev.vars.example .dev.vars
npx wrangler d1 migrations apply micvolo --local
npx wrangler d1 execute micvolo --local --file=seeds/demo.sql
npm run dev
```

Open `http://localhost:4321`. With `ENVIRONMENT=development` and `DEV_OTP_PREVIEW=true`, valid demo users see the OTP on the local login screen. Both conditions and a localhost hostname are required; production never returns the code.

Demo identities are `client@example.test` and `admin@example.test`. Demo data is intentionally outside `migrations/` and must never be applied remotely.

```bash
npm run build
git diff --check
```

## Cloudflare provisioning

Create/recreate resources deliberately; these commands are destructive only when you run the delete steps yourself.

```bash
npx wrangler d1 create micvolo --location weur
npx wrangler r2 bucket create micvolo --location weur
```

Copy the new D1 `database_id` into `wrangler.jsonc`. Keep the R2 bucket private: do not enable an `r2.dev` URL or public domain.

Apply the schema and bootstrap the production admin with your actual values (use a temporary SQL file rather than shell history when appropriate):

```bash
npx wrangler d1 migrations apply micvolo --remote
npx wrangler d1 execute micvolo --remote --command \
  "INSERT INTO users (id,email,display_name,role) VALUES ('ADMIN_UUID','ADMIN_EMAIL','micvolo','admin')"
```

Configure secrets without placing values in `wrangler.jsonc`:

```bash
npx wrangler secret put OTP_SECRET
```

`EMAIL_FROM` and `ENVIRONMENT` are non-secret Worker vars. `EMAIL_FROM` must use the exact sending domain onboarded in Cloudflare Email Service; this project uses `access@send.micvolo.com`. Email Service outbound sending is currently public beta, requires an eligible paid plan for arbitrary recipients, and is configured through the `EMAIL` `send_email` binding.

Deploy only after remote migrations and sender verification:

```bash
npm run deploy
```

See [`docs/architecture.md`](docs/architecture.md) for the data and security model and [`docs/brand-guidelines.md`](docs/brand-guidelines.md) for the visual identity, voice and interaction rules.

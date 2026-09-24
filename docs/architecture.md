# Collaboration ledger architecture

## Boundaries

Astro renders `/`, `/projects`, `/projects/letter-flow`, `/graphic-experiments`, `/graphic-experiments/*`, `/table-games`, `/table-games/camaleonte/*` and `/table-games/reazione-a-catena` at build time. Auth, portal, admin, API and private document routes opt into on-demand rendering. No client framework, ORM, UI kit or charting package is used.

Native experiences (Lab, Letter Flow, Chameleon, Teamword) are implemented as in-repo Astro pages and client scripts. They render inline in the site shell and reuse the persistent `SiteRail`; no cross-origin iframe is used. Dynamic experiment modules in Lab are lazy-loaded on the client.

- **D1 (`DB`)** stores identities, one-project client ownership, OTP challenges, revocable sessions, time, timeline, invoice and payment records.
- **R2 (`DOCUMENTS`)** stores private PDFs under random object keys. Keys are never authorization credentials or exposed as public URLs.
- **Cloudflare Email Service (`EMAIL`)** sends structured text/HTML OTP messages from `EMAIL_FROM`.

Time is stored as integer minutes and money as integer euro cents. Each project snapshots its hourly rate, defaulting to 4000 cents. Aggregate statistics remain SQL projections rather than duplicated mutable data.

## Authentication and authorization

Client and admin have distinct login routes and requested roles. The admin email must match both an active D1 admin and `ADMIN_EMAIL`. Client identities are created only from the admin backoffice; there is no public signup.

A six-digit code is generated with Web Crypto rejection sampling and stored only as an HMAC over challenge id, normalized email and code using `OTP_SECRET`. Challenges expire after ten minutes, allow five attempts, invalidate earlier challenges and are throttled per identity and hashed source IP. Responses do not reveal whether an account exists.

Successful verification conditionally consumes the challenge once, creates a random opaque session token, stores only its SHA-256 digest, and writes an HttpOnly, SameSite=Lax cookie. Production uses the `Secure` `__Host-micvolo_session` cookie. Sessions expire after one year and are revoked on POST logout.

Every mutation validates same-origin `Origin` and independently requires the admin role. Client project queries derive ownership from the authenticated user rather than a route slug. Document downloads repeat project ownership checks for both roles and return `private, no-store`, `nosniff` responses.

## File safety

Admin uploads are restricted to non-empty PDF files of at most 10 MiB. The handler checks MIME type, extension and `%PDF-` signature, generates a random R2 key, then inserts metadata into D1. A failed D1 insert deletes the new R2 object as compensation. Malware scanning and large-file direct uploads are intentionally deferred.

## Operations

`migrations/0001_foundation.sql` is the production baseline. `seeds/demo.sql` is local-only. Never edit an applied migration; append a forward migration. Keep `.dev.vars`, secrets, customer data and document contents out of Git and logs.

Before production: verify Email Service sender DNS, replace the recreated D1 id in Wrangler, apply migrations, add the admin identity, configure `OTP_SECRET` and `ADMIN_EMAIL`, test OTP delivery, and confirm the R2 bucket has no public access.

Deploy only with `npm run deploy`: it builds and deploys the generated SSR entry (`dist/server/wrangler.json`, assets `dist/client`), so `/api/*` is wired; deploying the bare root `wrangler.jsonc` serves the static build only and 404s every API route. Secrets are not deployed with the code — after creating the Worker, set them once with `wrangler secret put OTP_SECRET` (missing `OTP_SECRET` makes `/api/auth/request-code` throw a 500 in `otpHmac`). The dev-only OTP preview stays compiled out of every build (`import.meta.env.DEV`).

## Intentionally deferred

- edit/delete interfaces and audit-event export;
- automated invoice PDF generation or payment-provider integration;
- malware scanning and presigned large uploads;
- passkeys or hardware-backed admin authentication;
- multi-project clients, multiple admins and granular staff roles;
- accounting/GDPR policy decisions, backup automation and retention schedules.

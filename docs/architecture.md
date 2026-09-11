# Collaboration ledger architecture

## Boundaries

Astro renders `/`, `/projects` and `/work/*` at build time. Auth, portal, admin, API and private document routes opt into on-demand rendering. No client framework, ORM, UI kit or charting package is used.

- **D1 (`DB`)** stores identities, one-project client ownership, OTP challenges, revocable sessions, time, timeline, invoice and payment records.
- **R2 (`DOCUMENTS`)** stores private PDFs under random object keys. Keys are never authorization credentials or exposed as public URLs.
- **Cloudflare Email Service (`EMAIL`)** sends structured text/HTML OTP messages from `EMAIL_FROM`.

Time is stored as integer minutes and money as integer euro cents. Each project snapshots its hourly rate, defaulting to 4000 cents. Aggregate statistics remain SQL projections rather than duplicated mutable data.

## Authentication and authorization

Client and admin have distinct login routes and requested roles. The admin email must match both an active D1 admin and `ADMIN_EMAIL`. Client identities are created only from the admin backoffice; there is no public signup.

A six-digit code is generated with Web Crypto rejection sampling and stored only as an HMAC over challenge id, normalized email and code using `OTP_SECRET`. Challenges expire after ten minutes, allow five attempts, invalidate earlier challenges and are throttled per identity and hashed source IP. Responses do not reveal whether an account exists.

Successful verification conditionally consumes the challenge once, creates a random opaque session token, stores only its SHA-256 digest, and writes an HttpOnly, SameSite=Lax cookie. Production uses the `Secure` `__Host-micvolo_session` cookie. Sessions expire after seven days and are revoked on POST logout.

Every mutation validates same-origin `Origin` and independently requires the admin role. Client project queries derive ownership from the authenticated user rather than a route slug. Document downloads repeat project ownership checks for both roles and return `private, no-store`, `nosniff` responses.

## File safety

Admin uploads are restricted to non-empty PDF files of at most 10 MiB. The handler checks MIME type, extension and `%PDF-` signature, generates a random R2 key, then inserts metadata into D1. A failed D1 insert deletes the new R2 object as compensation. Malware scanning and large-file direct uploads are intentionally deferred.

## Operations

`migrations/0001_foundation.sql` is the production baseline. `seeds/demo.sql` is local-only. Never edit an applied migration; append a forward migration. Keep `.dev.vars`, secrets, customer data and document contents out of Git and logs.

Before production: verify Email Service sender DNS, replace the recreated D1 id in Wrangler, apply migrations, add the admin identity, configure `OTP_SECRET` and `ADMIN_EMAIL`, test OTP delivery, and confirm the R2 bucket has no public access.

## Intentionally deferred

- edit/delete interfaces and audit-event export;
- automated invoice PDF generation or payment-provider integration;
- malware scanning and presigned large uploads;
- passkeys or hardware-backed admin authentication;
- multi-project clients, multiple admins and granular staff roles;
- accounting/GDPR policy decisions, backup automation and retention schedules.

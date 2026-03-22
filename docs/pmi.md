# PMI — Project Portal & Freelance OS
**Michele Volonghi · micvolo.com**
*Version 3.0 — March 2026*

> Living document — update whenever there is a significant change in direction.
> The portal design must follow the visual identity already established on micvolo.com — Claude Code must read the existing project before touching any styles.

---

## 1. Vision & Goal

### The Problem
Freelancing in Italy lives in a grey zone: the client does not understand the value of the work, cannot see what is happening during the project, and the invoice always comes as a surprise. This leads to price negotiations, late payments, and strained relationships.

### The Solution
A two-part system:
1. **Public portfolio** — repositioning as a premium professional with transparent pricing and a clear philosophy
2. **Private project portal** — a protected area for each project where the client sees everything in real time: hours worked, activity log, quote, payment status, technical details, and account credentials

### Financial Goal
- **Target**: €40/hour × 80 hours/month = **€3,200/month**
- **Strategy**: fewer clients, higher perceived value, on-time payments
- **Personal KPI**: always at least 1 active project + 1 in pipeline

---

## 2. Tech Stack

| Component | Technology | Reason |
|---|---|---|
| Framework | **Astro** (already in use) | Visual identity already established, do not reinvent |
| Hosting | **Cloudflare Pages** | Free, very fast, Git-based deploy |
| Database | **Cloudflare D1** (SQLite edge) | Serverless, zero cost |
| Portal auth | Simple per-project password | No signup, zero friction for the client |
| Quote PDF | Upload to **Cloudflare R2** (private) | Not publicly exposed, only via authenticated embed |
| Activity log | **Claude Code Skill** via Cloudflare API | Conversational, no commands to remember |

---

## 3. Site Structure

```
micvolo.com/
│
├── / (Public portfolio — already exists, content to be updated)
│   ├── Hero
│   ├── Services with indicative prices
│   ├── Philosophy and transparency
│   ├── Selected work
│   └── Contact
│
└── /project/[slug] (Private project portal)
    ├── Password login
    └── Project dashboard
        ├── Header: name, status, dates
        ├── Project description + technologies
        ├── Project accounts and credentials
        ├── Hours section (flexible: with or without estimate)
        ├── Activity timeline (list + calendar)
        ├── Financial summary
        │   ├── Fixed quote / time & materials
        │   ├── Maintenance (if applicable)
        │   └── Payment status
        └── Quote PDF (protected)
```

---

## 4. Project Portal — Detailed Specs

### 4.1 Authentication

- URL: `micvolo.com/project/projectname`
- Password format: `dev+projectname` (e.g. `dev+seafront`, `dev+lawfirm`)
- No account, no email — just a shared password sent via message
- **Session cookie: 1 month** — the client does not have to re-enter it frequently
- Wrong password: generic error message, no hints

### 4.2 Project Header

Always visible at the top:

```
Project Name           Status Badge       Start → Estimated End
"Studio Rossi Website" 🟡 In Progress     15 Feb → 30 Mar 2026
```

**Possible statuses:**
- 🔵 `Starting` — agreement reached, kicking off
- 🟡 `In Progress` — active work
- 🟠 `On Hold` — blocked (e.g. waiting for content from client)
- 🟢 `Completed` — delivered
- ⚫ `Maintenance` — project delivered, retainer active

### 4.3 Project Description & Technical Details

Always visible section (collapsible on mobile). Contains everything the client might forget or need to look up.

**Description block:**
Free text — what was built, why, for whom. Written in plain human language.

**Technologies used:**
List of technologies and services chosen for the project, each with a one-line plain-language explanation.

Example:
```
⚡ Astro          Main site framework
☁️ Cloudflare     Hosting, domain, and protection
📦 Sanity CMS     Panel to manage content independently
📧 Resend         Sends emails from the site
```

**Accounts & Credentials:**
The most valuable section for the client. All accounts created or used for the project, with credentials in plain text and indicative annual cost where applicable.

This data is sensitive — already protected by the portal login, but Claude Code must treat it as critical data in the DB.

Structure of each account entry:
```
┌─────────────────────────────────────────────────┐
│  🌐 Domain                                       │
│  Service: Namecheap                             │
│  URL: namecheap.com                             │
│  Username: studiorossi@gmail.com                │
│  Password: xK9#mLpQ                             │
│  Cost: ~€15/year                                │
│  Notes: renew before January 2027               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  📧 Professional email                          │
│  Service: Google Workspace                      │
│  URL: admin.google.com                          │
│  Username: info@studiorossi.it                  │
│  Password: WsP7!nRq2                            │
│  Cost: ~€72/year (€6/month)                     │
│  Notes: Business Starter plan, 1 user           │
└─────────────────────────────────────────────────┘
```

Possible account types (non-exhaustive): Domain, Hosting / Cloud, Email, CMS, Analytics, Payments, Newsletter, Social, Other.

**Total recurring costs:**
At the bottom of the section, an automatic summary of all annual costs combined:
```
💸 Estimated recurring costs: ~€162/year  (~€13.50/month)
```

> Implementation note: account data is stored as structured records in the DB, not free text — required to calculate costs automatically.

### 4.4 Hours Section

This section is **flexible**: not every project has an estimated number of hours. There are two modes, defined when the project is created.

---

**Mode A — Fixed-quote (agreed estimate)**

Shows the hours progress bar.

```
Estimated Hours    Hours Worked    Remaining
      40h               27h           13h
[████████████████████████░░░░░░░░░░]  67%
```

Progress bar behavior:
- < 80% of estimate → neutral/ok color (follows site design system)
- 80–100% → visual warning
- > 100% → alert + message: "This project has exceeded the initial estimate — I will reach out to update it together"

Below the bar: "Estimate based on the quote dated [date]"

---

**Mode B — Time & materials (open, €40/hour)**

No estimate bar. Shows only the running hours counter and the total accrued.

```
Hours worked so far: 27h
Total accrued: €1,080  (27h × €40/hour)
```

---

### 4.5 Activity Timeline (Project Log)

Two views: **list** (default) and **calendar** (toggle).

**List View:**
```
────────────────────────────────────
📅 Wednesday 19 March · 3.5h
🎨 Homepage design — wireframe and font selection
   Hero section implementation with animations

📅 Monday 17 March · 2h
📞 Client call + feedback review
   Mobile navigation adjustments

📅 Friday 14 March · 4h
⚙️ Project setup + initial deploy
   Domain and SSL configuration
────────────────────────────────────
```

**Calendar View:**
- Current month
- Each day worked: colored dot or small number showing hours
- Click on a day → expands detail
- Future days are empty

**Activity categories (with emoji):**
- 🎨 `design` — graphics, UI, wireframes
- ⚙️ `dev` — development, code, deploy
- 📞 `call` — calls, meetings, feedback sessions
- 🐛 `fix` — corrections, bug fixes
- 📝 `content` — copy, SEO, images
- 🔧 `maintenance` — updates, monitoring

**Rules for activity notes:**
- Plain human language, not technical jargon
- Max 2–3 lines per day
- Michele's internal notes are **not** visible to the client

### 4.6 Financial Summary

Answers: "how much do I owe, how much have I paid, what is still due?"

**Fixed quote case:**
```
┌─────────────────────────────────────────┐
│  FINANCIAL SUMMARY                      │
│                                         │
│  Total quote              €1,600.00     │
│  Deposit paid (50%)      -  €800.00     │
│  ─────────────────────────────────────  │
│  Balance due               €800.00      │
│                                         │
│  📅 Due date: 30 March 2026             │
│  Status: ⏳ Awaiting balance payment    │
└─────────────────────────────────────────┘
```

**Time & materials case:**
```
┌─────────────────────────────────────────┐
│  FINANCIAL SUMMARY                      │
│                                         │
│  Hourly rate               €40.00/h     │
│  Hours worked                  27h      │
│  Total accrued            €1,080.00     │
│  Deposits paid            -  €500.00    │
│  ─────────────────────────────────────  │
│  Current balance            €580.00     │
│                                         │
│  Status: 🟡 Work in progress            │
└─────────────────────────────────────────┘
```

**If the project includes maintenance:**
Separate block below the main summary:

```
┌─────────────────────────────────────────┐
│  MAINTENANCE                            │
│                                         │
│  Monthly retainer          €150.00      │
│  Estimated annual cost   €1,800.00      │
│                                         │
│  Next invoice: 1 April 2026             │
│  Status: ✅ Active                       │
└─────────────────────────────────────────┘
```

**Payment statuses:**
- ⏳ `Awaiting deposit` — with due date
- ✅ `Deposit received` — work can begin
- ⏳ `Awaiting balance` — project delivered, final payment pending
- ✅ `Paid in full` — all good
- 🔄 `Maintenance active` — recurring retainer

**Future (phase 2):** direct payment link via PayPal.me or Stripe

### 4.7 Quote PDF

- PDF stored on **Cloudflare R2**, not publicly accessible
- Accessible only after portal login, via signed URL or authenticated Astro route
- Section title: "Your quote"
- Embedded viewer in the page + "Download PDF" button
- Immutable document — it is the contract

---

## 5. Data & Persistence

The database is **Cloudflare D1** (SQLite edge). Schema is defined in `migrations/0001_initial.sql`.

**Project**
slug (PK), display_name, client_name, description, status, start_date, end_date, hours_mode (fixed|materials), hourly_rate, quote_amount, deposit_amount, balance_due_date, has_maintenance, maintenance_monthly, pdf_url, password_hash, created_at

**WorkLog**
id, project_slug (FK), date, hours, public_description, category (design|dev|call|fix|content|maintenance), private_notes, created_at

**Payment**
id, project_slug (FK), type (deposit|balance|retainer), amount, date, status (expected|received), created_at

**ProjectAccount**
id, project_slug (FK), account_type, service_name, url, username, password_plain, annual_cost, notes, sort_order

**ProjectTechnology**
id, project_slug (FK), emoji, name, description, sort_order

---

## 6. Claude Code Skill — Daily Log

### Approach
The skill is not a traditional CLI. It uses the **Cloudflare API** to interact directly with D1 through the Astro project's API routes. Interaction happens in natural language inside Claude Code — no commands to memorize.

### Supported operations

**Daily log:**
> "Today I worked 3.5 hours on seafront — homepage design, wireframe and font selection. Category: design."

The skill inserts the record and responds with the updated project summary.

**Create a new project:**
> "Create a new project: Studio Rossi, slug studiorossi, fixed quote mode, €1600, 40 estimated hours, deposit €800"

**Update payment status:**
> "Mark the deposit for studiorossi as received"

**Add an account to a project:**
> "Add to studiorossi: domain on Namecheap, user studiorossi@gmail.com, password xK9#m, cost €15/year, renew January 2027"

**Add a technology:**
> "Add to seafront: Sanity CMS — panel to manage content independently"

**Get project summary:**
> "How is the seafront project looking?"

The skill responds with: status, hours, budget, next deadline, any alerts.

**Update maintenance:**
> "The studiorossi project has active maintenance at €150/month, next invoice 1 April"

---

## 7. Public Portfolio — Content

> The design is already defined on micvolo.com. Only the text content needs updating.

### Services and Indicative Prices

Target clients: small businesses, professionals (lawyers, doctors, studios), medium-sized companies.

| Service | Indicative range | Notes |
|---|---|---|
| Brochure website | €900 – €1,800 | Astro or Next.js, up to 8 pages, responsive, basic SEO |
| Website with CMS | €1,400 – €2,800 | With panel to manage content independently (Sanity, Keystatic) |
| Web app / Internal tool | €2,000 – €5,000 | Dashboard, admin panel, client portal, custom tool |
| E-commerce | €1,800 – €3,500 | Product catalogue, payments, order management |
| Redesign / Migration | €800 – €2,000 | Starting from an existing site to rebuild or migrate |
| Maintenance | €100 – €250/month | Technical updates, minor content changes (up to 2h/month included) |
| Consulting / Audit | €40/hour, min. 2h | Code review, stack decisions, technical strategy |
| Time & materials | €40/hour | Ongoing support, iterative development, no fixed quote |

> Showing prices on the portfolio is a natural filter: it eliminates the wrong clients before the first contact, and signals to the right ones that you are a professional who knows their own value.

### What Maintenance Includes

- Dependency, library, and CMS updates
- Minor content changes (text, images, prices) — up to 2 hours included per month
- Basic uptime monitoring
- Priority response on urgent requests
- Additional hours beyond the 2 included: €40/hour

### Philosophy and Transparency

- Every quote is written, never verbal
- Project portal: the client sees hours in real time
- One or two projects at a time: focus = quality
- Async communication, response within 24h on working days
- All credentials and access always in the client's hands, never withheld

### Working Process

```
1. Discovery call (30 min, free)
2. Written quote (within 48h)
3. Deposit → work begins → portal goes live
4. Work visible in real time
5. Delivery + final payment
```

---

## 8. Roadmap

### Phase 1 — Foundation ✅
- [x] `/project/[slug]` route with authentication (1-month cookie)
- [x] D1 database: full schema + test seed
- [x] Project header + status
- [x] Description section + technologies
- [x] Accounts/credentials section (sensitive data, post-login only)

### Phase 2 — Hours & Timeline
- [ ] Hours section: Mode A (fixed estimate) and Mode B (time & materials)
- [ ] Progress bar with color behaviors
- [ ] List + calendar timeline
- [ ] Categories with emoji

### Phase 3 — Financials & PDF
- [ ] Financial summary (both modes)
- [ ] Maintenance block (if applicable)
- [ ] Protected PDF viewer (Cloudflare R2 + signed URL)
- [ ] Payment statuses

### Phase 4 — Claude Code Skill
- [ ] Core skill: daily log via natural language
- [ ] Skill: create project
- [ ] Skill: update payments
- [ ] Skill: add account / technology
- [ ] Skill: project summary

### Phase 5 — Portfolio & Polish
- [ ] Portfolio content update (services + prices)
- [ ] Mobile optimization for portal
- [ ] Email notification to client on new log entry (optional)

### Backlog
- [ ] Michele's dashboard: overview of all active projects
- [ ] Direct payment link (Stripe / PayPal.me)
- [ ] PDF report export for the client
- [ ] Archive of completed projects

---

## 9. Operational Notes

**Managing client passwords:**
- Format: `dev+[slug]` all lowercase (e.g. `dev+studiorossi`)
- Send to client with direct link: `micvolo.com/project/projectname`
- 1-month cookie: low friction, no hassle

**Credentials security:**
- Account credentials are sensitive data in the DB
- Protected by portal login — never exposed in public pages or logs

**Maintenance projects:**
- If a project has maintenance, the portal stays active after delivery
- The client keeps access and sees the monthly maintenance logs

---

*Planning document — micvolo.com — March 2026*
*Living document — update freely throughout development*

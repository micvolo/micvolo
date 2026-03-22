-- Test project: "seafront"
-- Password: dev+seafront  (SHA-256: 6f36561433ab5e8d3552d65bda6dafe05ce2501fc4879e060445c8c91081cb14)

INSERT INTO Project (
  slug, display_name, client_name, description, status,
  start_date, end_date, hours_mode, hourly_rate,
  quote_amount, deposit_amount, has_maintenance, maintenance_monthly,
  password_hash
) VALUES (
  'seafront',
  'Seafront Resort',
  'Marco Bianchi',
  'Complete website redesign for a boutique coastal resort. Includes booking integration, multilingual support (IT/EN), and a custom CMS so the client can manage rooms and seasonal offers independently.',
  'in_progress',
  '2026-02-15',
  '2026-03-30',
  'fixed',
  40,
  2400,
  800,
  1,
  120,
  '6f36561433ab5e8d3552d65bda6dafe05ce2501fc4879e060445c8c91081cb14'
);

INSERT INTO ProjectTechnology (project_slug, emoji, name, description, sort_order) VALUES
  ('seafront', '⚡', 'Astro',          'Main site framework — generates fast, SEO-friendly static pages', 0),
  ('seafront', '☁️', 'Cloudflare Pages', 'Global CDN hosting — the site loads fast from anywhere in the world', 1),
  ('seafront', '🎨', 'GSAP',            'Handles scroll animations and smooth page transitions', 2),
  ('seafront', '📦', 'Sveltia CMS',     'Content management panel — you can update texts and images without a developer', 3);

INSERT INTO ProjectAccount (project_slug, account_type, service_name, url, username, password_plain, annual_cost, notes, sort_order) VALUES
  ('seafront', 'domain',  'Namecheap',      'https://namecheap.com',       'marco@seafrontresort.it', 'Nx7!mQpR', 18,  'Renews February 2027', 0),
  ('seafront', 'hosting', 'Cloudflare Pages','https://dash.cloudflare.com', 'michele@stra.studio',     NULL,       0,   'Free tier — no action needed', 1),
  ('seafront', 'cms',     'GitHub',         'https://github.com',          'seafront-cms',            'ghp_REPLACE', 0, 'OAuth app used by Sveltia CMS for content edits', 2),
  ('seafront', 'email',   'Google Workspace','https://admin.google.com',   'info@seafrontresort.it',  'Ws9!nRq2', 72,  'Business Starter, 1 user — renews monthly', 3);

INSERT INTO Payment (project_slug, type, amount, date, status) VALUES
  ('seafront', 'deposit', 800,  '2026-02-15', 'received'),
  ('seafront', 'balance', 1600, '2026-03-30', 'expected');

-- LOCAL DEVELOPMENT ONLY. Never apply this file to production.
INSERT INTO users (id, email, display_name, role) VALUES
  ('usr_admin_demo', 'admin@example.test', 'micvolo', 'admin'),
  ('usr_client_demo', 'client@example.test', 'Demo Client', 'client');

INSERT INTO projects (
  id, slug, client_user_id, name, description, status, started_on, target_date, estimated_minutes
) VALUES (
  'prj_demo', 'north-star', 'usr_client_demo', 'North Star',
  'A focused digital product collaboration, from direction through delivery.',
  'active', '2026-01-12', '2026-04-30', 7200
);

INSERT INTO worklogs (id, project_id, worked_on, minutes, category, public_note, private_note, created_by) VALUES
  ('log_demo_1', 'prj_demo', '2026-02-03', 240, 'strategy', 'Mapped the product structure and agreed the first delivery sequence.', '', 'usr_admin_demo'),
  ('log_demo_2', 'prj_demo', '2026-02-06', 360, 'design', 'Built the core interface system and responsive page rhythm.', '', 'usr_admin_demo'),
  ('log_demo_3', 'prj_demo', '2026-02-10', 300, 'development', 'Implemented the first production-ready feature set.', '', 'usr_admin_demo');

INSERT INTO timeline_events (id, project_id, kind, title, body, occurred_at, visibility, created_by) VALUES
  ('evt_demo_1', 'prj_demo', 'milestone', 'Direction approved', 'Scope and visual direction are locked for the first delivery.', unixepoch('2026-02-04 10:00:00'), 'public', 'usr_admin_demo');

INSERT INTO invoices (id, project_id, number, period_start, period_end, issued_on, due_on, status, subtotal_cents, total_cents) VALUES
  ('inv_demo_1', 'prj_demo', '2026-001', '2026-02-01', '2026-02-28', '2026-03-01', '2026-03-15', 'issued', 60000, 60000);
INSERT INTO invoice_lines (id, invoice_id, description, quantity_minutes, unit_rate_cents, amount_cents) VALUES
  ('line_demo_1', 'inv_demo_1', 'February collaboration', 900, 4000, 60000);

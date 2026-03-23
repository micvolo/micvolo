-- Simulate hour overload for seafront (pushes total from 41h to ~68h, over the 60h estimate)
INSERT INTO WorkLog (project_slug, date, hours, public_description, category) VALUES
  ('seafront', '2026-03-18', 2, 'Client feedback call — extensive revision requests', 'call'),
  ('seafront', '2026-03-19', 5, 'Homepage redesign after client feedback — second round', 'design'),
  ('seafront', '2026-03-20', 3, 'Booking widget fixes and edge case handling', 'fix'),
  ('seafront', '2026-03-21', 4, 'SEO metadata, sitemap, and multilingual hreflang setup', 'dev'),
  ('seafront', '2026-03-22', 4, 'Performance audit and image optimisation pass', 'dev'),
  ('seafront', '2026-03-23', 3, 'Final copy revisions and CMS content population', 'content'),
  ('seafront', '2026-03-23', 2, 'Pre-launch QA — mobile, tablet, and cross-browser', 'fix');

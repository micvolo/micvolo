-- Admin tracking store: the AdminProject / EstimateDoc / TimeEntry shapes of the
-- read-only project pages, plus the "documenti" attachment category (R2-backed).
-- Derived numbers are never stored: estimatedHours = SUM(estimate_docs.hours),
-- workedHours = SUM(time_entries.hours), estimate amount = hours x rate.

CREATE TABLE tracking_projects (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rate REAL NOT NULL DEFAULT 40 CHECK (rate > 0),
  sort_order INTEGER NOT NULL
) STRICT;

CREATE TABLE estimate_docs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES tracking_projects(slug) ON DELETE CASCADE,
  date TEXT NOT NULL,
  hours REAL NOT NULL CHECK (hours > 0),
  amount REAL NOT NULL CHECK (amount >= 0),
  note TEXT NOT NULL,
  pdf_url TEXT NOT NULL
) STRICT;

CREATE TABLE time_entries (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES tracking_projects(slug) ON DELETE CASCADE,
  date TEXT NOT NULL,
  hours INTEGER NOT NULL CHECK (hours BETWEEN 1 AND 8),
  note TEXT NOT NULL
) STRICT;

-- one row per uploaded "documento"; the file lives in the DOCUMENTS R2 bucket
CREATE TABLE tracking_documents (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES tracking_projects(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE INDEX idx_estimate_docs_slug_date ON estimate_docs(slug, date);
CREATE INDEX idx_time_entries_slug_date ON time_entries(slug, date);
CREATE INDEX idx_tracking_documents_slug ON tracking_documents(slug, created_at DESC);

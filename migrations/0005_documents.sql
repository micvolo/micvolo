CREATE TABLE IF NOT EXISTS ProjectDocument (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL REFERENCES Project(slug) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  r2_key       TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL DEFAULT 0,
  uploaded_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_document_project ON ProjectDocument(project_slug, uploaded_at);

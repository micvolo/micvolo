CREATE TABLE IF NOT EXISTS Project (
  slug               TEXT PRIMARY KEY,
  display_name       TEXT NOT NULL,
  client_name        TEXT NOT NULL,
  description        TEXT,
  status             TEXT NOT NULL DEFAULT 'starting'
                     CHECK (status IN ('starting','in_progress','on_hold','completed','maintenance')),
  start_date         TEXT,
  end_date           TEXT,
  hours_mode         TEXT NOT NULL DEFAULT 'materials'
                     CHECK (hours_mode IN ('fixed','materials')),
  hourly_rate        REAL,
  quote_amount       REAL,
  deposit_amount     REAL,
  balance_due_date   TEXT,
  has_maintenance    INTEGER NOT NULL DEFAULT 0,
  maintenance_monthly REAL,
  pdf_url            TEXT,
  password_hash      TEXT NOT NULL,
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS WorkLog (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug       TEXT NOT NULL REFERENCES Project(slug) ON DELETE CASCADE,
  date               TEXT NOT NULL,
  hours              REAL NOT NULL,
  public_description TEXT,
  category           TEXT NOT NULL DEFAULT 'dev'
                     CHECK (category IN ('design','dev','call','fix','content','maintenance')),
  private_notes      TEXT,
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Payment (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug       TEXT NOT NULL REFERENCES Project(slug) ON DELETE CASCADE,
  type               TEXT NOT NULL
                     CHECK (type IN ('deposit','balance','retainer')),
  amount             REAL NOT NULL,
  date               TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'expected'
                     CHECK (status IN ('expected','received')),
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ProjectAccount (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug       TEXT NOT NULL REFERENCES Project(slug) ON DELETE CASCADE,
  account_type       TEXT,
  service_name       TEXT NOT NULL,
  url                TEXT,
  username           TEXT,
  password_plain     TEXT,
  annual_cost        REAL,
  notes              TEXT,
  sort_order         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ProjectTechnology (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug       TEXT NOT NULL REFERENCES Project(slug) ON DELETE CASCADE,
  emoji              TEXT NOT NULL,
  name               TEXT NOT NULL,
  description        TEXT NOT NULL,
  sort_order         INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_worklog_project  ON WorkLog(project_slug);
CREATE INDEX IF NOT EXISTS idx_payment_project  ON Payment(project_slug);
CREATE INDEX IF NOT EXISTS idx_account_project  ON ProjectAccount(project_slug, sort_order);
CREATE INDEX IF NOT EXISTS idx_tech_project     ON ProjectTechnology(project_slug, sort_order);

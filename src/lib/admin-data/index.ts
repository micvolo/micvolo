// D1-backed read facade for the admin tracking store
// (migrations/0002_admin_tracking.sql + seeds/admin-tracking.sql).

/** one logged work session, rendered like "24 settembre 2025 · 2 ore · cosa fatta" */
export interface TimeEntry {
  id: string;
  slug: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  hours: number;
  note: string;
}

/** preventivo: the base quote or a mid-project extension, backed by its PDF in public/preventivi/ */
export interface EstimateDoc {
  id: string;
  slug: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  hours: number;
  /** EUR, = hours × project rate at the time of the quote */
  amount: number;
  note: string;
  pdfUrl: string;
}

/** a "documenti" attachment row; the file lives in the DOCUMENTS R2 bucket */
export interface ProjectDocument {
  id: string;
  slug: string;
  /** display name, the link label */
  name: string;
  /** unix seconds */
  createdAt: number;
  /** R2 object key, served through /documents/<key> */
  r2Key: string;
}

export interface AdminProject {
  slug: string;
  title: string;
  description: string;
  /** EUR per hour (default 40); estimate amount = hours × rate, monthly earnings = monthly hours × rate */
  rate: number;
  estimates: EstimateDoc[];
  entries: TimeEntry[];
  /** "documenti" attachments, newest first; an empty list is a completely valid state */
  documents: ProjectDocument[];
}

/** project rate used when a projects row omits `rate` */
export const DEFAULT_RATE_EUR = 40;

interface ProjectRow {
  slug: string;
  title: string;
  description: string;
  rate: number;
}

interface EstimateRow {
  id: string;
  slug: string;
  date: string;
  hours: number;
  amount: number;
  note: string;
  pdf_url: string;
}

interface EntryRow {
  id: string;
  slug: string;
  date: string;
  hours: number;
  note: string;
}

interface DocumentRow {
  id: string;
  slug: string;
  name: string;
  r2_key: string;
  created_at: number;
}

function groupBySlug<T extends { slug: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const list = grouped.get(row.slug);
    if (list) list.push(row);
    else grouped.set(row.slug, [row]);
  }
  return grouped;
}

/** seeded admin data grouped per project, estimates and entries ascending by date */
export async function getProjects(db: D1Database): Promise<AdminProject[]> {
  const [projects, estimates, entries, documents] = await Promise.all([
    db.prepare('SELECT slug, title, description, rate FROM tracking_projects ORDER BY sort_order, slug')
      .all<ProjectRow>(),
    db.prepare('SELECT id, slug, date, hours, amount, note, pdf_url FROM estimate_docs ORDER BY date, id')
      .all<EstimateRow>(),
    db.prepare('SELECT id, slug, date, hours, note FROM time_entries ORDER BY date, id')
      .all<EntryRow>(),
    db.prepare('SELECT id, slug, name, r2_key, created_at FROM tracking_documents ORDER BY created_at DESC, name')
      .all<DocumentRow>(),
  ]);
  const estimatesBySlug = groupBySlug(estimates.results.map((row) => ({
    id: row.id,
    slug: row.slug,
    date: row.date,
    hours: row.hours,
    amount: row.amount,
    note: row.note,
    pdfUrl: row.pdf_url,
  })));
  const entriesBySlug = groupBySlug(entries.results);
  const documentsBySlug = groupBySlug(documents.results.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    createdAt: row.created_at,
    r2Key: row.r2_key,
  })));
  return projects.results.map((row) => ({
    slug: row.slug,
    title: row.title,
    description: row.description,
    rate: row.rate,
    estimates: estimatesBySlug.get(row.slug) ?? [],
    entries: entriesBySlug.get(row.slug) ?? [],
    documents: documentsBySlug.get(row.slug) ?? [],
  }));
}

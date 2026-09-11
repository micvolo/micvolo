export interface ProjectSummary {
  id: string;
  slug: string;
  client_user_id: string;
  client_name: string;
  client_email: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'complete';
  started_on: string | null;
  target_date: string | null;
  estimated_minutes: number;
  hourly_rate_cents: number;
  currency: 'EUR';
  worked_minutes: number;
  invoiced_cents: number;
  paid_cents: number;
}

export interface WorklogRow {
  id: string;
  worked_on: string;
  minutes: number;
  category: string;
  public_note: string;
  private_note: string;
  created_at: number;
}

export interface TimelineRow {
  id: string;
  occurred_at: number;
  kind: string;
  title: string;
  body: string;
  source: 'event' | 'worklog';
  minutes: number | null;
}

export interface DocumentRow {
  id: string;
  project_id: string;
  kind: string;
  title: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  period: string | null;
  created_at: number;
}

export interface InvoiceRow {
  id: string;
  number: string;
  period_start: string;
  period_end: string;
  issued_on: string;
  due_on: string;
  status: string;
  total_cents: number;
  paid_cents: number;
}

const PROJECT_SELECT = `
  SELECT p.*, u.display_name AS client_name, u.email AS client_email,
    COALESCE((SELECT SUM(w.minutes) FROM worklogs w WHERE w.project_id = p.id), 0) AS worked_minutes,
    COALESCE((SELECT SUM(i.total_cents) FROM invoices i WHERE i.project_id = p.id AND i.status != 'void'), 0) AS invoiced_cents,
    COALESCE((SELECT SUM(pay.amount_cents) FROM payments pay WHERE pay.project_id = p.id), 0) AS paid_cents
  FROM projects p JOIN users u ON u.id = p.client_user_id`;

export async function getClientProject(db: D1Database, userId: string): Promise<ProjectSummary | null> {
  return db.prepare(`${PROJECT_SELECT} WHERE p.client_user_id = ?1 LIMIT 1`).bind(userId).first<ProjectSummary>();
}

export async function getProject(db: D1Database, id: string): Promise<ProjectSummary | null> {
  return db.prepare(`${PROJECT_SELECT} WHERE p.id = ?1 LIMIT 1`).bind(id).first<ProjectSummary>();
}

export async function getAllProjects(db: D1Database): Promise<ProjectSummary[]> {
  return (await db.prepare(`${PROJECT_SELECT} ORDER BY p.updated_at DESC`).all<ProjectSummary>()).results;
}

export async function getWorklogs(db: D1Database, projectId: string): Promise<WorklogRow[]> {
  return (await db.prepare('SELECT * FROM worklogs WHERE project_id = ?1 ORDER BY worked_on DESC, created_at DESC').bind(projectId).all<WorklogRow>()).results;
}

export async function getTimeline(db: D1Database, projectId: string): Promise<TimelineRow[]> {
  return (await db.prepare(`
    SELECT id, occurred_at, kind, title, body, 'event' AS source, NULL AS minutes
    FROM timeline_events WHERE project_id = ?1 AND visibility = 'public'
    UNION ALL
    SELECT id, unixepoch(worked_on || ' 12:00:00') AS occurred_at, category AS kind,
           public_note AS title, '' AS body, 'worklog' AS source, minutes
    FROM worklogs WHERE project_id = ?1
    ORDER BY occurred_at DESC`).bind(projectId).all<TimelineRow>()).results;
}

export async function getDocuments(db: D1Database, projectId: string): Promise<DocumentRow[]> {
  return (await db.prepare('SELECT id, project_id, kind, title, original_filename, mime_type, size_bytes, period, created_at FROM documents WHERE project_id = ?1 ORDER BY created_at DESC').bind(projectId).all<DocumentRow>()).results;
}

export async function getInvoices(db: D1Database, projectId: string): Promise<InvoiceRow[]> {
  return (await db.prepare(`SELECT i.*, COALESCE(SUM(p.amount_cents), 0) AS paid_cents
    FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id
    WHERE i.project_id = ?1 GROUP BY i.id ORDER BY i.period_start DESC`).bind(projectId).all<InvoiceRow>()).results;
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function formatHours(minutes: number): string {
  return `${(minutes / 60).toLocaleString('en', { maximumFractionDigits: 1 })}h`;
}

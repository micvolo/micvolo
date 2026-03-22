export interface Project {
  slug: string;
  display_name: string;
  client_name: string;
  description: string | null;
  status: 'starting' | 'in_progress' | 'on_hold' | 'completed' | 'maintenance';
  start_date: string | null;
  end_date: string | null;
  hours_mode: 'fixed' | 'materials';
  hourly_rate: number | null;
  quote_amount: number | null;
  deposit_amount: number | null;
  balance_due_date: string | null;
  has_maintenance: number;
  maintenance_monthly: number | null;
  pdf_url: string | null;
  password_hash: string;
  created_at: string;
}

export interface WorkLog {
  id: number;
  project_slug: string;
  date: string;
  hours: number;
  public_description: string | null;
  category: 'design' | 'dev' | 'call' | 'fix' | 'content' | 'maintenance';
  private_notes: string | null;
  created_at: string;
}

export interface Payment {
  id: number;
  project_slug: string;
  type: 'deposit' | 'balance' | 'retainer';
  amount: number;
  date: string;
  status: 'expected' | 'received';
  created_at: string;
}

export interface ProjectAccount {
  id: number;
  project_slug: string;
  account_type: string | null;
  service_name: string;
  url: string | null;
  username: string | null;
  password_plain: string | null;
  annual_cost: number | null;
  notes: string | null;
  sort_order: number;
}

export interface ProjectTechnology {
  id: number;
  project_slug: string;
  emoji: string;
  name: string;
  description: string;
  sort_order: number;
}

export async function getProject(db: D1Database, slug: string): Promise<Project | null> {
  return db.prepare('SELECT * FROM Project WHERE slug = ?').bind(slug).first<Project>() ?? null;
}

export async function getProjectAccounts(db: D1Database, slug: string): Promise<ProjectAccount[]> {
  const result = await db
    .prepare('SELECT * FROM ProjectAccount WHERE project_slug = ? ORDER BY sort_order')
    .bind(slug)
    .all<ProjectAccount>();
  return result.results;
}

export async function getProjectTechnologies(db: D1Database, slug: string): Promise<ProjectTechnology[]> {
  const result = await db
    .prepare('SELECT * FROM ProjectTechnology WHERE project_slug = ? ORDER BY sort_order')
    .bind(slug)
    .all<ProjectTechnology>();
  return result.results;
}

export async function getProjectWorkLogs(db: D1Database, slug: string): Promise<WorkLog[]> {
  const result = await db
    .prepare('SELECT * FROM WorkLog WHERE project_slug = ? ORDER BY date DESC, created_at DESC')
    .bind(slug)
    .all<WorkLog>();
  return result.results;
}

export async function getProjectPayments(db: D1Database, slug: string): Promise<Payment[]> {
  const result = await db
    .prepare('SELECT * FROM Payment WHERE project_slug = ? ORDER BY date ASC')
    .bind(slug)
    .all<Payment>();
  return result.results;
}

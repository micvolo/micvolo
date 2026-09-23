// View models and formatting for the read-only project pages. The shapes mirror
// the `src/lib/admin-data` contract (AdminProject / EstimateDoc / TimeEntry).

export interface EstimateDoc {
  id: string;
  slug: string;
  date: string;
  hours: number;
  amount: number;
  note: string;
  pdfUrl: string;
}

export interface TimeEntry {
  id: string;
  slug: string;
  date: string;
  hours: number;
  note: string;
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
  /** Hourly rate in EUR for this project; historical projects may run 20-30. */
  rate: number;
  estimates: EstimateDoc[];
  entries: TimeEntry[];
  /** "documenti" attachments, newest first; an empty list is a completely valid state */
  documents: ProjectDocument[];
}

/** Default hourly rate; projects without one fall back to this. */
const RATE_EUR = 40;

export function projectRate(project: AdminProject): number {
  return project.rate > 0 ? project.rate : RATE_EUR;
}

const ITALIAN_MONTHS = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

/** Plain number with an Italian decimal comma: 1600, 1,5. */
export function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');
}

export function formatOre(hours: number): string {
  return `${formatNumber(hours)} ${hours === 1 ? 'ora' : 'ore'}`;
}

export function formatEuro(amount: number): string {
  return `${formatNumber(Math.round(amount))} euro`;
}

export function workedLabel(hours: number): string {
  return `${formatNumber(hours)} ${hours === 1 ? 'ora lavorata' : 'ore lavorate'}`;
}

/** Italian long-form date for an ISO date: "24 settembre 2025". */
export function italianDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} ${ITALIAN_MONTHS[month - 1]} ${year}`;
}

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return `${ITALIAN_MONTHS[month - 1]} ${year}`;
}

export function sortByDate<T extends { date: string }>(rows: T[], direction: 'asc' | 'desc'): T[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => (a.date < b.date ? -factor : a.date > b.date ? factor : 0));
}

export function estimatedHours(project: AdminProject): number {
  return project.estimates.reduce((sum, estimate) => sum + estimate.hours, 0);
}

export function workedHours(project: AdminProject): number {
  return project.entries.reduce((sum, entry) => sum + entry.hours, 0);
}

export interface EstimateRow extends EstimateDoc {
  cumulativeHours: number;
}

/** Estimates oldest first with a running total, so extensions read as one story. */
export function estimateRows(project: AdminProject): EstimateRow[] {
  let cumulativeHours = 0;
  return sortByDate(project.estimates, 'asc').map((estimate) => {
    cumulativeHours += estimate.hours;
    return { ...estimate, cumulativeHours };
  });
}

export interface MonthTotal {
  key: string;
  label: string;
  hours: number;
  amount: number;
}

/** Hours and earnings (each project's monthly hours x its own rate) per month,
 * across projects, latest first. */
export function monthlyTotals(projects: AdminProject[]): MonthTotal[] {
  const byMonth = new Map<string, { hours: number; amount: number }>();
  for (const project of projects) {
    for (const entry of project.entries) {
      const key = entry.date.slice(0, 7);
      const month = byMonth.get(key) ?? { hours: 0, amount: 0 };
      month.hours += entry.hours;
      month.amount += entry.hours * projectRate(project);
      byMonth.set(key, month);
    }
  }
  return [...byMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, month]) => ({ key, label: monthLabel(key), hours: month.hours, amount: month.amount }));
}

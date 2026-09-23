// explicit .ts specifier keeps this module directly runnable under node (see check.mjs)
import { projects, estimates, timeEntries } from './data.ts';

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

export interface AdminProject {
  slug: string;
  title: string;
  description: string;
  /** EUR per hour (default 40); estimate amount = hours × rate, monthly earnings = monthly hours × rate */
  rate: number;
  estimates: EstimateDoc[];
  entries: TimeEntry[];
}

/** project rate used when a projects row omits `rate` */
export const DEFAULT_RATE_EUR = 40;

const byDate = (a: { date: string }, b: { date: string }): number => a.date.localeCompare(b.date);

/** seeded admin data grouped per project, estimates and entries ascending by date */
export function getProjects(): AdminProject[] {
  return projects.map((row) => ({
    slug: row.slug,
    title: row.title,
    description: row.description,
    rate: row.rate ?? DEFAULT_RATE_EUR,
    estimates: estimates.filter((doc) => doc.slug === row.slug).sort(byDate),
    entries: timeEntries.filter((entry) => entry.slug === row.slug).sort(byDate),
  }));
}

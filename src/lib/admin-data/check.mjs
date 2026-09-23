#!/usr/bin/env node
/**
 * Invariant checker for the admin data store. Run after every edit:
 *   node src/lib/admin-data/check.mjs
 */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, estimates, timeEntries } from './data.ts';
import { getProjects, DEFAULT_RATE_EUR } from './index.ts';

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../../public');
const problems = [];
const fail = (message) => problems.push(message);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ESTIMATE_NOTE = /stimo \d+ ore a \d+ euro/;

const ids = new Set();
for (const project of projects) {
  const rate = project.rate ?? DEFAULT_RATE_EUR;
  if (!(rate > 0)) fail(`projects ${project.slug}: rate must be > 0`);
  for (const row of [...estimates.filter((r) => r.slug === project.slug), ...timeEntries.filter((r) => r.slug === project.slug)]) {
    if (ids.has(row.id)) fail(`duplicate id ${row.id}`);
    ids.add(row.id);
    if (!ISO_DATE.test(row.date) || Number.isNaN(Date.parse(row.date))) fail(`${row.id}: date must be ISO YYYY-MM-DD`);
  }
  for (const doc of estimates.filter((r) => r.slug === project.slug)) {
    if (doc.amount !== doc.hours * rate) fail(`${doc.id}: amount ${doc.amount} != hours × rate (${doc.hours} × ${rate})`);
    if (!ESTIMATE_NOTE.test(doc.note)) fail(`${doc.id}: note must state "stimo N ore a M euro"`);
    if (doc.note.endsWith('.')) fail(`${doc.id}: note must not end with a period`);
    if (doc.pdfUrl !== `/preventivi/${project.slug}/${doc.id}.pdf`) fail(`${doc.id}: pdfUrl must be /preventivi/${project.slug}/${doc.id}.pdf`);
    if (!existsSync(join(PUBLIC_DIR, ...doc.pdfUrl.split('/').filter(Boolean)))) fail(`${doc.id}: missing PDF public${doc.pdfUrl}`);
    if (!(doc.hours > 0)) fail(`${doc.id}: hours must be > 0`);
  }
  const entries = timeEntries.filter((r) => r.slug === project.slug);
  for (const entry of entries) {
    if (!Number.isInteger(entry.hours) || entry.hours < 1 || entry.hours > 8) fail(`${entry.id}: hours must be an integer 1-8`);
    if (!entry.note || entry.note[0] !== entry.note[0].toLowerCase()) fail(`${entry.id}: note must be a lowercase log line`);
    if (entry.note.endsWith('.')) fail(`${entry.id}: note must not end with a period`);
  }
  for (const rows of [estimates.filter((r) => r.slug === project.slug), entries]) {
    rows.forEach((row, i) => {
      if (i && rows[i - 1].date > row.date) fail(`${row.id}: rows must stay ascending by date`);
    });
  }
  const firstEntry = entries[0];
  const firstEstimate = estimates.filter((r) => r.slug === project.slug)[0];
  if (firstEntry && firstEstimate && firstEstimate.date > firstEntry.date) fail(`${project.slug}: base estimate must predate the first entry`);
}

for (const row of [...estimates, ...timeEntries]) {
  if (!projects.some((project) => project.slug === row.slug)) fail(`${row.id}: unknown project slug ${row.slug}`);
}

const assembled = getProjects();
for (const project of assembled) {
  const worked = project.entries.reduce((sum, entry) => sum + entry.hours, 0);
  const estimated = project.estimates.reduce((sum, doc) => sum + doc.hours, 0);
  project.entries.forEach((entry, i) => {
    if (i && project.entries[i - 1].date > entry.date) fail(`${project.slug}: getProjects() entries not sorted`);
    if (entry.slug !== project.slug) fail(`${project.slug}: getProjects() entry slug mismatch`);
  });
  console.log(`${project.slug.padEnd(28)} rate ${String(project.rate).padStart(2)} EUR/h · ${String(worked).padStart(3)}h worked / ${String(estimated).padStart(3)}h estimated`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
const hours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
const amount = estimates.reduce((sum, doc) => sum + doc.amount, 0);
console.log(`\nok — ${assembled.length} projects · ${estimates.length} estimates (${amount} EUR) · ${timeEntries.length} entries · ${hours}h worked`);

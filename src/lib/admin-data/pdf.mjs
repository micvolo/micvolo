#!/usr/bin/env node
/**
 * Minimal dependency-free PDF writer for the preventivo docs (public/preventivi/).
 *   node src/lib/admin-data/pdf.mjs --all    regenerate every estimate PDF from data.ts
 *   node src/lib/admin-data/pdf.mjs <out.pdf relative to public/> "riga di testo" ...
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(HERE, '../../../public');

const ITALIAN_MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

/** '2025-09-24' -> '24 settembre 2025' */
export function italianDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${ITALIAN_MONTHS[month - 1]} ${year}`;
}

/** map typography to WinAnsi single bytes */
const WIN_ANSI = { '\u2014': '\x97', '\u2013': '\x96', '\u2019': '\x92', '\u201c': '\x93', '\u201d': '\x94' };

const escapeText = (line) =>
  [...String(line)].map((ch) => WIN_ANSI[ch] ?? ch).join('').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

/** one-page A4 PDF with the given text lines, returned as latin1-encoded bytes */
export function buildPdf(lines) {
  const text = ['BT', '/F1 11 Tf', '14 TL', '56 780 Td', ...lines.flatMap((line) => [`(${escapeText(line)}) Tj`, 'T*']), 'ET'].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(text, 'latin1')} >>\nstream\n${text}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const startxref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  return pdf;
}

/** publicPath like '/preventivi/<slug>/<id>.pdf' -> written under public/ */
export function writePdf(publicPath, lines) {
  const file = join(PUBLIC_DIR, ...publicPath.split('/').filter(Boolean));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, buildPdf(lines), 'latin1');
  return file;
}

/** rendered content of one preventivo, matching its EstimateDoc row */
export function preventivoLines(project, doc, isExtension) {
  return [
    isExtension ? 'Proroga preventivo' : 'Preventivo',
    project.title,
    italianDate(doc.date),
    '',
    doc.note,
    '',
    `${doc.hours} ore \u00d7 ${project.rate ?? 40} EUR/h`,
    `Totale ${doc.amount} EUR`,
  ];
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [first, ...rest] = process.argv.slice(2);
  if (first === '--all') {
    const { projects, estimates } = await import('./data.ts');
    for (const project of projects) {
      const docs = estimates.filter((doc) => doc.slug === project.slug).sort((a, b) => a.date.localeCompare(b.date));
      docs.forEach((doc, i) => writePdf(doc.pdfUrl, preventivoLines(project, doc, i > 0)));
    }
    console.log(`wrote ${estimates.length} preventivi under public/preventivi/`);
  } else if (first) {
    writePdf(first.startsWith('/') ? first : `/${first}`, rest);
    console.log(`wrote public/${first}`);
  } else {
    console.error('usage: pdf.mjs --all | pdf.mjs <out.pdf relative to public/> "line" ...');
    process.exit(1);
  }
}

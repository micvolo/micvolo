// Validates every project at src/data/projects/<slug>.json against a mirror of the
// `projects` schema in src/content.config.ts: shape, co-located asset existence and
// filename↔slug consistency (every image ref lives in ./<slug>/ and every file in
// that folder is referenced). Run: node scripts/validate-projects.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'src/data/projects');

const TOP_LEVEL = ['title', 'date', 'tags', 'url', 'description', 'summary', 'cover', 'notes', 'screens'];
const NOTE_SHAPE = ['lead', 'items'];
const SINGLE_SHAPE = ['file', 'width', 'alt'];
const ROW_SHAPE = ['layout', 'width', 'row'];
const SPLIT_SHAPE = ['layout', 'width', 'file', 'alt', 'aside'];
const ROW_ITEM_SHAPE = ['file', 'alt'];
const WIDTHS = ['full', 'half', 'quarter'];
const ROW_LAYOUTS = ['grid', 'pair', 'quad'];

const errors = [];
const fail = (slug, message) => errors.push(`${slug}: ${message}`);

const hasKeys = (value, keys) =>
  typeof value === 'object' && value !== null && Object.keys(value).every((key) => keys.includes(key));

const checkNote = (slug, note, where) => {
  if (typeof note === 'string') return;
  if (!hasKeys(note, NOTE_SHAPE) || typeof note.lead !== 'string' || !Array.isArray(note.items)
    || !note.items.every((item) => typeof item === 'string')) {
    fail(slug, `${where}: note must be a string or { lead, items: string[] }`);
  }
};

const checkImageRef = (slug, ref, where) => {
  if (typeof ref !== 'string' || !ref.startsWith(`./${slug}/`)) {
    fail(slug, `${where}: "${ref}" must point into ./${slug}/ (filename↔slug)`);
    return;
  }
  if (!fs.existsSync(path.join(DATA, ref))) fail(slug, `${where}: missing asset ${ref}`);
};

const checkScreen = (slug, slot, index) => {
  const where = `screens[${index}]`;
  if (!hasKeys(slot, SINGLE_SHAPE.concat(ROW_SHAPE, SPLIT_SHAPE))) {
    fail(slug, `${where}: unknown slot keys ${Object.keys(slot ?? {}).join(', ')}`);
    return;
  }
  const referenced = [];
  if (Array.isArray(slot.row)) {
    if (!hasKeys(slot, ROW_SHAPE) || !ROW_LAYOUTS.includes(slot.layout) || !WIDTHS.includes(slot.width)
      || !slot.row.every((item) => hasKeys(item, ROW_ITEM_SHAPE) && typeof item.alt === 'string')) {
      fail(slug, `${where}: malformed row slot`);
      return;
    }
    slot.row.forEach((item) => referenced.push(item.file));
  } else if ('aside' in slot) {
    if (!hasKeys(slot, SPLIT_SHAPE) || slot.layout !== 'split' || !WIDTHS.includes(slot.width)
      || typeof slot.alt !== 'string') {
      fail(slug, `${where}: malformed split slot`);
      return;
    }
    checkNote(slug, slot.aside, `${where}.aside`);
    referenced.push(slot.file);
  } else {
    if (!hasKeys(slot, SINGLE_SHAPE) || !['full', 'half'].includes(slot.width) || typeof slot.alt !== 'string') {
      fail(slug, `${where}: malformed single slot`);
      return;
    }
    referenced.push(slot.file);
  }
  referenced.forEach((file) => checkImageRef(slug, file, where));
  return referenced;
};

const jsonFiles = fs.readdirSync(DATA).filter((file) => file.endsWith('.json')).sort();
for (const file of jsonFiles) {
  const slug = file.replace(/\.json$/, '');
  const data = JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'));
  const folder = path.join(DATA, slug);

  if (!hasKeys(data, TOP_LEVEL)) fail(slug, `unknown top-level keys: ${Object.keys(data).join(', ')}`);
  for (const key of ['title', 'date', 'tags', 'description', 'summary']) {
    if (typeof data[key] !== 'string' || !data[key]) fail(slug, `${key} must be a non-empty string`);
  }
  if ('url' in data && !/^https?:\/\//.test(data.url)) fail(slug, `url must be http(s): ${data.url}`);
  if (Number.isNaN(Date.parse(data.date))) fail(slug, `date must parse: ${data.date}`);

  checkImageRef(slug, data.cover, 'cover');
  if (data.cover !== `./${slug}/cover.webp`) fail(slug, `cover must be ./${slug}/cover.webp`);

  if (!Array.isArray(data.notes) || !Array.isArray(data.screens)) {
    fail(slug, 'notes and screens must be arrays');
    continue;
  }
  data.notes.forEach((note, index) => checkNote(slug, note, `notes[${index}]`));
  if (data.notes.length < data.screens.length) fail(slug, 'every screen slot needs a note above it');

  const screenRefs = data.screens.flatMap((slot, index) => checkScreen(slug, slot, index) ?? []);

  if (!fs.existsSync(folder)) {
    fail(slug, `missing asset folder ${slug}/`);
  } else {
    const files = fs.readdirSync(folder).sort();
    const expected = ['cover.webp', ...screenRefs.map((ref) => path.basename(ref))].sort();
    if (files.join(',') !== expected.join(',')) {
      fail(slug, `folder ${slug}/ holds [${files}] but the JSON references [${expected}]`);
    }
    files.filter((name) => name !== 'cover.webp' && !name.startsWith('screen-'))
      .forEach((name) => fail(slug, `${name}: screens must be named screen-*.webp`));
  }

  if (!errors.some((error) => error.startsWith(`${slug}:`))) console.log(`ok   ${slug}`);
}

console.log(`\n${jsonFiles.length} projects checked, ${errors.length} errors`);
if (errors.length) {
  errors.forEach((error) => console.error(`ERR  ${error}`));
  process.exit(1);
}

// Strict field validators shared by the reserved-area APIs.

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_PATTERN.test(value);
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && validDate(value);
}

/** note voice: non-empty lowercase log line without a final period */
export function isNoteLine(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim() === value
    && value[0] === value[0].toLowerCase() && !value.endsWith('.');
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

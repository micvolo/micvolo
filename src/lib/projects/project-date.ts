/** Project date as a bare year, or 'Current' while the project is still ongoing (same calendar year or newer) */
export const projectDateLabel = (date: Date, now: Date = new Date()): string =>
  date.getFullYear() >= now.getFullYear() ? 'Current' : String(date.getFullYear());

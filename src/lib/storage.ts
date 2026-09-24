// One place for persisted client state (localStorage / sessionStorage). Every
// access goes through these helpers so missing or corrupt data degrades to the
// caller's fallback instead of throwing.
//
// Key scheme is `micvolo-<feature>-<item>` for anything new. The legacy key
// strings below are kept verbatim: they address data already stored in
// visitors' browsers (custom game topics, saved Letter Flow presets, palette)
// and renaming them would silently discard it. Classic scripts that cannot
// import this module (public/theme.js) keep their own copy of their key.

export const STORAGE_KEYS = {
  /** shader palette toggle; public/theme.js keeps its own copy of this key */
  palette: 'micvolo-palette-v2',
  /** Camaleonte round state (sessionStorage) */
  chameleonGame: 'chameleon-game',
  /** Camaleonte custom topics */
  chameleonTopics: 'customTopics',
  /** Letter Flow saved preset */
  letterFlowParams: 'micvolo-letter-flow-params',
} as const;

/** Parsed JSON for a key, or undefined when missing or corrupt. */
export function loadJson(area: Storage, key: string): unknown {
  try {
    const stored = area.getItem(key);
    return stored === null ? undefined : (JSON.parse(stored) as unknown);
  } catch {
    return undefined;
  }
}

export function saveJson(area: Storage, key: string, value: unknown): void {
  try {
    area.setItem(key, JSON.stringify(value));
  } catch { /* Storage may be unavailable. */ }
}

export function removeJson(area: Storage, key: string): void {
  try {
    area.removeItem(key);
  } catch { /* Storage may be unavailable. */ }
}

// Focus-modality marker for the lab and Letter Flow. The accent focus outline
// must appear for keyboard focus only: `:focus-visible` alone is not enough
// because text inputs (and some browsers' pointer-focus heuristics) match it
// after mouse clicks and canvas drags. The current modality is published as
// [data-focus-modality] on <html> and the outline rules are gated on it
// (params.css, LabCard.astro, LetterFlowCard.astro).
let started = false;

const NAVIGATION_KEYS = new Set(['Tab', 'Escape', 'Home', 'End', 'PageUp', 'PageDown']);

export function initFocusModality(): void {
  if (started) return;
  started = true;
  const set = (modality: 'keyboard' | 'pointer') => {
    document.documentElement.dataset.focusModality = modality;
  };
  set('pointer');
  document.addEventListener('pointerdown', () => set('pointer'), true);
  document.addEventListener('keydown', (event) => {
    // Typing text must not pop outlines on a pointer-focused control; only
    // focus-navigation keys mark the keyboard modality.
    if (NAVIGATION_KEYS.has(event.key) || event.key.startsWith('Arrow')) set('keyboard');
  }, true);
}

(function () {
  var STORAGE_KEY = 'micvolo-palette-v2';
  var memoryPalette = null;

  function isPalette(value) {
    return value === 'accent' || value === 'greyscale';
  }

  function storedPalette() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return isPalette(value) ? value : memoryPalette;
    } catch (_) {
      return memoryPalette;
    }
  }

  // First visit (nothing stored yet): accent palette is on by default.
  function effectivePalette() {
    return storedPalette() || 'accent';
  }

  function applyPaletteToDocument(target, palette) {
    if (!target) return;
    target.documentElement.dataset.palette = palette;
  }

  function syncPaletteControls() {
    var palette = effectivePalette();
    document.querySelectorAll('[data-palette-toggle]').forEach(function (button) {
      var accent = palette === 'accent';
      var label = accent ? 'Use greyscale shader palette' : 'Use accent shader palette';
      button.setAttribute('aria-checked', String(accent));
      button.setAttribute('aria-label', label);
      button.title = label;
    });
  }

  function applyPalette(palette) {
    memoryPalette = palette;
    try {
      localStorage.setItem(STORAGE_KEY, palette);
    } catch (_) {}
    applyPaletteToDocument(document, palette);
    syncPaletteControls();
  }

  function togglePalette() {
    applyPalette(effectivePalette() === 'accent' ? 'greyscale' : 'accent');
  }

  function bindPaletteControls() {
    document.querySelectorAll('[data-palette-toggle]').forEach(function (button) {
      if (button.dataset.paletteBound) return;
      button.dataset.paletteBound = 'true';
      button.addEventListener('click', togglePalette);
    });
    syncPaletteControls();
  }

  memoryPalette = storedPalette();
  applyPaletteToDocument(document, effectivePalette());

  document.addEventListener('astro:before-swap', function (event) {
    applyPaletteToDocument(event.newDocument, effectivePalette());
  });
  document.addEventListener('astro:page-load', bindPaletteControls);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPaletteControls, { once: true });
  } else {
    bindPaletteControls();
  }
})();

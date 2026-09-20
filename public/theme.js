(function () {
  var STORAGE_KEY = 'micvolo-theme';
  var LEGACY_KEY = 'theme';
  var systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
  var memoryTheme = null;

  function isTheme(value) {
    return value === 'light' || value === 'dark';
  }

  function systemTheme() {
    return systemPreference.matches ? 'dark' : 'light';
  }

  function storedTheme() {
    try {
      var value = sessionStorage.getItem(STORAGE_KEY);
      return isTheme(value) ? value : memoryTheme;
    } catch (_) {
      return memoryTheme;
    }
  }

  function migrateLegacyTheme() {
    try {
      var current = sessionStorage.getItem(STORAGE_KEY);
      if (isTheme(current)) return current;

      var legacy = localStorage.getItem(LEGACY_KEY);
      localStorage.removeItem(LEGACY_KEY);
      if (isTheme(legacy)) {
        sessionStorage.setItem(STORAGE_KEY, legacy);
        return legacy;
      }
    } catch (_) {}
    return null;
  }

  function effectiveTheme() {
    return storedTheme() || systemTheme();
  }

  function applyThemeToDocument(target, preference) {
    if (!target) return;
    if (isTheme(preference)) target.documentElement.dataset.theme = preference;
    else delete target.documentElement.dataset.theme;

    var theme = preference || systemTheme();
    var lightMeta = target.querySelector('#theme-color-light');
    var darkMeta = target.querySelector('#theme-color-dark');
    if (lightMeta) lightMeta.setAttribute('media', theme === 'light' ? 'all' : 'not all');
    if (darkMeta) darkMeta.setAttribute('media', theme === 'dark' ? 'all' : 'not all');
  }

  function syncThemeControls() {
    var theme = effectiveTheme();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      var next = theme === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-checked', String(theme === 'dark'));
      button.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      button.title = 'Switch to ' + next + ' theme';
    });
    applyThemeToDocument(document, storedTheme());
  }

  var initialTheme = migrateLegacyTheme() || storedTheme();
  memoryTheme = initialTheme;
  applyThemeToDocument(document, initialTheme);

  function applyTheme(next) {
    memoryTheme = next;
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch (_) {}
    document.documentElement.dataset.theme = next;
    syncThemeControls();
  }

  function toggleTheme() {
    var root = document.documentElement;
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.dataset.themeSwitching = '';

    function clearSwitchingState() {
      delete root.dataset.themeSwitching;
    }

    if (!reduceMotion && document.startViewTransition) {
      document.startViewTransition(function () {
        applyTheme(next);
      }).finished.then(clearSwitchingState, clearSwitchingState);
    } else {
      applyTheme(next);
      window.setTimeout(clearSwitchingState, 320);
    }
  }

  function bindThemeControls() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      if (button.dataset.themeBound) return;
      button.dataset.themeBound = '1';
      button.addEventListener('click', toggleTheme);
    });
    syncThemeControls();
  }

  document.addEventListener('astro:before-swap', function (event) {
    applyThemeToDocument(event.newDocument, storedTheme());
  });
  document.addEventListener('astro:page-load', bindThemeControls);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindThemeControls, { once: true });
  } else {
    bindThemeControls();
  }

  systemPreference.addEventListener('change', function () {
    if (!storedTheme()) delete document.documentElement.dataset.theme;
    syncThemeControls();
  });
})();

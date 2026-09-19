(function () {
  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function storedTheme() {
    try {
      var value = localStorage.getItem('theme');
      return value === 'light' || value === 'dark' ? value : null;
    } catch (_) {
      return null;
    }
  }

  function effectiveTheme() {
    return storedTheme() || systemTheme();
  }

  function syncThemeControls() {
    var theme = effectiveTheme();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.setAttribute('aria-checked', String(theme === 'dark'));
      button.title = theme === 'dark' ? 'Use light theme' : 'Use dark theme';
    });
    var meta = document.querySelector('#theme-color');
    if (meta) meta.content = theme === 'dark' ? '#1e1e1e' : '#f7f7f5';
  }

  try {
    var initial = localStorage.getItem('theme');
    if (initial === 'light' || initial === 'dark') {
      document.documentElement.dataset.theme = initial;
    }
  } catch (_) {}

  function applyTheme(next) {
    try {
      if (next === systemTheme()) {
        localStorage.removeItem('theme');
        delete document.documentElement.dataset.theme;
      } else {
        localStorage.setItem('theme', next);
        document.documentElement.dataset.theme = next;
      }
    } catch (_) {
      document.documentElement.dataset.theme = next;
    }
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
      setTimeout(clearSwitchingState, 320);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindThemeControls);
  } else {
    bindThemeControls();
  }
  document.addEventListener('astro:page-load', bindThemeControls);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeControls);
})();

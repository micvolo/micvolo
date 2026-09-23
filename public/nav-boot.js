// Pre-paint scroll state for the public shell.
// External classic script (loaded from <head>) so it can run before first paint and
// satisfies `script-src 'self'` — inline scripts are blocked by the CSP.
//
// - Rail scroll ("micvolo-rail-scroll"): localStorage is the single source of truth,
//   saved before every swap and kept fresh while scrolling, re-applied before paint on
//   every swap and full load. Swaps can relocate or recreate the rail (portal/admin
//   round trips use a layout without it), so the position is re-applied every time.
// - Homepage scroll ("micvolo-home-scroll"): saved when leaving "/", restored once on
//   return (sessionStorage, like the browser's own back/forward scroll memory). This
//   powers the mobile "Return to homepage" card in SiteRail.
(function () {
  var RAIL_SCROLL_KEY = 'micvolo-rail-scroll';
  var HOME_SCROLL_KEY = 'micvolo-home-scroll';
  var homeReturnPending = false;

  function readRail() {
    try {
      return localStorage.getItem(RAIL_SCROLL_KEY);
    } catch (_) {
      return null;
    }
  }

  function writeRail(value) {
    try {
      localStorage.setItem(RAIL_SCROLL_KEY, value);
    } catch (_) {}
  }

  function readHome() {
    try {
      return sessionStorage.getItem(HOME_SCROLL_KEY);
    } catch (_) {
      return null;
    }
  }

  function writeHome(value) {
    try {
      sessionStorage.setItem(HOME_SCROLL_KEY, value);
    } catch (_) {}
  }

  function consumeHome() {
    var value = readHome();
    try {
      sessionStorage.removeItem(HOME_SCROLL_KEY);
    } catch (_) {}
    return value;
  }

  function offset(value) {
    if (value === null) return null;
    var y = Number(value);
    return Number.isFinite(y) ? y : null;
  }

  // Called while the old page is still on screen (astro:before-swap runs before the
  // DOM swap, so window.location and both scroll positions are still the old page's)
  // and on a hard unload.
  function saveScrollState(fromPathname) {
    var rail = document.querySelector('.rail');
    if (rail) writeRail(String(rail.scrollTop));
    if (fromPathname === '/') writeHome(String(window.scrollY));
  }

  function restoreScrollState(isFullLoad) {
    var rail = document.querySelector('.rail');
    if (rail) {
      var railY = offset(readRail());
      if (railY !== null) rail.scrollTop = railY;
    }
    if (window.location.pathname === '/') {
      var savedHome = consumeHome();
      // On history traversal the router restores its own per-entry position, which is
      // more precise than the single value saved when last leaving the homepage.
      if (isFullLoad || homeReturnPending) {
        var homeY = offset(savedHome);
        if (homeY !== null) window.scrollTo({ left: 0, top: homeY, behavior: 'instant' });
      }
    }
    homeReturnPending = false;
  }

  // Keep the rail position fresh while scrolling (throttled via rAF).
  function bindRailScrollPersistence() {
    var rail = document.querySelector('.rail');
    if (!rail || rail.dataset.navBootScrollBound) return;
    rail.dataset.navBootScrollBound = 'true';
    var ticking = false;
    rail.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        writeRail(String(rail.scrollTop));
      });
    }, { passive: true });
  }

  document.addEventListener('astro:before-swap', function (event) {
    saveScrollState(event.from.pathname);
    homeReturnPending = event.navigationType !== 'traverse' && event.to.pathname === '/';
  });

  // astro:after-swap fires right after the DOM swap and the router's own scroll
  // handling, before the new page is painted.
  document.addEventListener('astro:after-swap', function () {
    restoreScrollState(false);
  });

  // Swaps that drop and recreate the rail (portal/admin round trips) leave it without
  // a scroll listener; rebind on every page-load with a per-element guard.
  document.addEventListener('astro:page-load', bindRailScrollPersistence);

  window.addEventListener('pagehide', function () {
    saveScrollState(window.location.pathname);
  });

  function onReady() {
    restoreScrollState(true);
    bindRailScrollPersistence();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();

/* Hermy Rigor Portfolio: main script */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Theme ---------- */
  function currentTheme() {
    return root.getAttribute('data-bs-theme') || 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-bs-theme', theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#121212' : '#EFEFEF');

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  function saveTheme(theme) {
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage blocked: ignore */ }
  }

  function initTheme() {
    applyTheme(currentTheme());
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        saveTheme(next);
      });
    });
  }

  // If the visitor never chose a theme, follow their device when it changes
  var mq = window.matchMedia('(prefers-color-scheme: light)');
  if (mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      var saved = null;
      try { saved = localStorage.getItem('theme'); } catch (err) {}
      if (!saved) applyTheme(e.matches ? 'light' : 'dark');
    });
  }

  /* ---------- Navbar: border appears after scrolling ---------- */
  function initNavbarScroll() {
    var nav = document.getElementById('siteNav');
    if (!nav) return;
    function update() { nav.classList.toggle('scrolled', window.scrollY > 10); }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Mobile menu: close first, then scroll to the section ---------- */
  function initMobileMenu() {
    var menuEl = document.getElementById('navMenu');
    if (!menuEl || !window.bootstrap) return;
    var menu = bootstrap.Offcanvas.getOrCreateInstance(menuEl);

    menuEl.querySelectorAll('a.nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (!menuEl.classList.contains('show')) return; // desktop: normal link behavior
        e.preventDefault();
        var hash = link.getAttribute('href');
        menuEl.addEventListener('hidden.bs.offcanvas', function () {
          var target = document.querySelector(hash);
          if (target) target.scrollIntoView();
          history.replaceState(null, '', hash);
        }, { once: true });
        menu.hide();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNavbarScroll();
    initMobileMenu();
  });
})();
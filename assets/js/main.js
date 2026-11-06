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

  /* ---------- Hero: decode effect ---------- */
  function initHeroDecode() {
    var nameEl = document.querySelector('[data-decode]');
    var roleEl = document.getElementById('heroRole');
    if (!nameEl || !roleEl) return;

    // Visitors who prefer reduced motion keep the plain static text
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ROLES = ['web development', 'IT support', 'IT staff roles'];
    var CHARS = '01<>/{}#%&*+=_-';

    function sleep(ms) {
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    // Scrambles every letter, then reveals them left to right
    async function decode(el, text, frameMs) {
      var frames = text.length * 3;
      for (var f = 0; f <= frames; f++) {
        var reveal = Math.floor(f / 3);
        var out = '';
        for (var i = 0; i < text.length; i++) {
          var c = text.charAt(i);
          out += (c === ' ' || i < reveal) ? c : CHARS.charAt(Math.floor(Math.random() * CHARS.length));
        }
        el.textContent = out;
        await sleep(frameMs);
      }
      el.textContent = text;
    }

    async function run() {
      await decode(nameEl, nameEl.getAttribute('data-decode'), 38);
      var i = 0;
      while (true) {
        while (document.hidden) { await sleep(500); } // pause in background tabs
        await decode(roleEl, ROLES[i % ROLES.length], 36);
        await sleep(2200);
        i++;
      }
    }

    // Wait for the fonts so the scramble never shows in the wrong typeface
    var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    ready.then(run);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNavbarScroll();
    initMobileMenu();
    initHeroDecode();
  });
})();
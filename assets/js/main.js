/* Hermy Rigor Portfolio: main script */
(function () {
  'use strict';

  var root = document.documentElement;

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

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(currentTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        saveTheme(next);
      });
    });
  });

  // If the visitor never chose a theme, follow their device when it changes
  var mq = window.matchMedia('(prefers-color-scheme: light)');
  if (mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      var saved = null;
      try { saved = localStorage.getItem('theme'); } catch (err) {}
      if (!saved) applyTheme(e.matches ? 'light' : 'dark');
    });
  }
})();
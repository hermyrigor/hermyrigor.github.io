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
    var sentinel = document.getElementById('navSentinel');
    if (!nav || !sentinel) return;

    // Very old browsers: just keep the border visible
    if (!('IntersectionObserver' in window)) {
      nav.classList.add('scrolled');
      return;
    }

    // The browser tells us when the marker leaves the screen, so we never read the scroll position
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Mobile menu: close first, then scroll to the section ---------- */
  function initMobileMenu() {
    var menuEl = document.getElementById('navMenu');
    if (!menuEl || !window.bootstrap) return;
    var menu = bootstrap.Offcanvas.getOrCreateInstance(menuEl);
    
    // Name the menu only while it is open (Bootstrap gives it role="dialog" at that time)
    menuEl.addEventListener('show.bs.offcanvas', function () {
      menuEl.setAttribute('aria-labelledby', 'navMenuLabel');
    });
    menuEl.addEventListener('hidden.bs.offcanvas', function () {
      menuEl.removeAttribute('aria-labelledby');
    });

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

    /* ---------- Project gallery: screenshot viewer ---------- */
  function initGallery() {
    var modalEl = document.getElementById('galleryModal');
    var buttons = document.querySelectorAll('[data-gallery-index]');
    if (!modalEl || !buttons.length || !window.bootstrap) return;

    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    var imgEl = document.getElementById('galleryImg');
    var capEl = document.getElementById('galleryCaption');
    var countEl = document.getElementById('galleryCount');

    // Read the thumbnails so the images and captions are written only once, in the HTML
    var items = Array.prototype.map.call(buttons, function (btn) {
      var img = btn.querySelector('img');
      return {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        caption: btn.querySelector('.shot-cap').textContent
      };
    });

    var index = 0;

    function show(i) {
      index = (i + items.length) % items.length; // wraps around at both ends
      imgEl.src = items[index].src;
      imgEl.alt = items[index].alt;
      capEl.textContent = items[index].caption;
      countEl.textContent = (index + 1) + ' / ' + items.length;
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        show(i);
        modal.show();
      });
    });

    document.getElementById('galleryPrev').addEventListener('click', function () { show(index - 1); });
    document.getElementById('galleryNext').addEventListener('click', function () { show(index + 1); });

    modalEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(index - 1); }
      else if (e.key === 'ArrowRight') { show(index + 1); }
    });
  }

    /* ---------- Scroll reveal: each block fades up once ---------- */
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var items = document.querySelectorAll('.section-head, .about-text, .card-c, .contact-list');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        el.classList.add('is-visible');
        // Remove the helper classes afterwards so normal hover effects work again
        setTimeout(function () { el.classList.remove('will-reveal', 'is-visible'); }, 700);
      });
    }, { threshold: 0.12 });

    items.forEach(function (el) {
      el.classList.add('will-reveal');
      io.observe(el);
    });
  }

    /* ---------- Contact: copy email address ---------- */
  function initCopyEmail() {
    var btn = document.getElementById('copyEmail');
    var status = document.getElementById('copyStatus');
    if (!btn || !status) return;

    function say(msg) {
      status.textContent = msg;
      setTimeout(function () { status.textContent = ''; }, 2500);
    }

    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(
          function () { say('Copied!'); },
          function () { say('Copy failed. Please select the address above.'); }
        );
      } else {
        say('Copy is not supported here. Please select the address above.');
      }
    });
  }

    /* ---------- Contact form: validation and sending ---------- */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var status = document.getElementById('cfStatus');
    var button = form.querySelector('button[type="submit"]');

    var rules = {
      cfName: function (v) {
        return v.length >= 2 && v.length <= 80 ? '' : 'Please enter your name (2 to 80 characters).';
      },
      cfEmail: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 254 ? '' : 'Please enter a valid email address.';
      },
      cfSubject: function (v) {
        return v.length >= 3 && v.length <= 120 ? '' : 'Please enter a subject (3 to 120 characters).';
      },
      cfMessage: function (v) {
        return v.length >= 10 && v.length <= 2000 ? '' : 'Please write a message (10 to 2000 characters).';
      }
    };

    function check(id) {
      var input = document.getElementById(id);
      var err = document.getElementById(id + 'Err');
      var msg = rules[id](input.value.trim());
      if (msg) {
        err.textContent = msg; // textContent, never innerHTML
        err.hidden = false;
        input.setAttribute('aria-invalid', 'true');
      } else {
        err.textContent = '';
        err.hidden = true;
        input.removeAttribute('aria-invalid');
      }
      return !msg;
    }

    Object.keys(rules).forEach(function (id) {
      var input = document.getElementById(id);
      input.addEventListener('blur', function () {
        if (input.value.trim() !== '') check(id);
      });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid')) check(id);
      });
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      status.textContent = '';

      var firstBad = null;
      Object.keys(rules).forEach(function (id) {
        if (!check(id) && !firstBad) firstBad = document.getElementById(id);
      });
      if (firstBad) { firstBad.focus(); return; }

      // Spam trap: a real visitor never fills this field. Pretend it worked and send nothing.
      var trap = form.querySelector('[name="company_website"]');
      if (trap && trap.value.trim() !== '') {
        status.textContent = 'Thanks! Your message has been sent.';
        form.reset();
        return;
      }

      button.disabled = true; // prevents double sends
      status.textContent = 'Sending…';

      var payload = {
        access_key: form.elements['access_key'].value,
        name: document.getElementById('cfName').value.trim(),
        email: document.getElementById('cfEmail').value.trim(),
        subject: '[Portfolio] ' + document.getElementById('cfSubject').value.trim(),
        message: document.getElementById('cfMessage').value.trim()
      };

      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 15000);

      try {
        var res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        var result = await res.json();
        if (res.ok && result.success) {
          status.textContent = 'Thanks! Your message has been sent. I’ll reply to the email address you gave.';
          form.reset();
        } else {
          throw new Error('Rejected by the form service');
        }
      } catch (err) {
        status.textContent = 'Sorry, your message could not be sent. Please try again later, or email me directly at hermyrigor18@gmail.com.';
      } finally {
        clearTimeout(timer);
        button.disabled = false;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNavbarScroll();
    initMobileMenu();
    initHeroDecode();
    initContactForm();
    initCopyEmail();
    initReveal();
    initGallery();
  });
})();